from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import json
import httpx
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Helpers ───

async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ─── Auth ───

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = resp.json()

    email = data["email"]
    name = data["name"]
    picture = data.get("picture", "")
    session_token = data["session_token"]

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if not existing:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "plan": "free",
            "wallet_balance": 100.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    else:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60
    )

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ─── Projects ───

@api_router.get("/projects")
async def get_projects(request: Request):
    user = await get_current_user(request)
    projects = await db.projects.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return projects

@api_router.post("/projects")
async def create_project(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    project = {
        "project_id": project_id,
        "user_id": user["user_id"],
        "name": body.get("name", "Untitled Project"),
        "business_type": body.get("business_type", "startup"),
        "status": "draft",
        "content": body.get("content", {}),
        "wizard_data": body.get("wizard_data", {}),
        "media": {},
        "published": False,
        "publish_url": "",
        "repo_url": "",
        "created_at": now,
        "updated_at": now
    }
    await db.projects.insert_one(project)
    created = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    return created

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await get_current_user(request)
    project = await db.projects.find_one(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, request: Request):
    user = await get_current_user(request)
    body = await request.json()
    update_data = {k: v for k, v in body.items() if k not in ["project_id", "user_id", "created_at", "_id"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = await db.projects.update_one(
        {"project_id": project_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.projects.delete_one(
        {"project_id": project_id, "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# ─── Wallet ───

@api_router.get("/wallet")
async def get_wallet(request: Request):
    user = await get_current_user(request)
    transactions = await db.wallet_transactions.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {
        "balance": user.get("wallet_balance", 100.0),
        "plan": user.get("plan", "free"),
        "transactions": transactions
    }

@api_router.post("/wallet/credit")
async def credit_wallet(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    amount = body.get("amount", 0)
    new_balance = user.get("wallet_balance", 0) + amount
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"wallet_balance": new_balance}})
    await db.wallet_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "type": "credit",
        "amount": amount,
        "description": body.get("description", "Wallet top-up"),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"balance": new_balance}

@api_router.post("/wallet/debit")
async def debit_wallet(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    amount = body.get("amount", 0)
    current = user.get("wallet_balance", 0)
    if current < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    new_balance = current - amount
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"wallet_balance": new_balance}})
    await db.wallet_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "type": "debit",
        "amount": amount,
        "description": body.get("description", "Service usage"),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"balance": new_balance}

@api_router.post("/wallet/upgrade")
async def upgrade_plan(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    plan = body.get("plan", "premium")
    cost = 49.0 if plan == "premium" else 0
    current = user.get("wallet_balance", 0)
    if current < cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    new_balance = current - cost
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"wallet_balance": new_balance, "plan": plan}}
    )
    if cost > 0:
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "type": "debit",
            "amount": cost,
            "description": f"Plan upgrade to {plan}",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    return {"balance": new_balance, "plan": plan}

# ─── AI Content Generation ───

@api_router.post("/ai/generate-content")
async def generate_content(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    business_info = body.get("business_info", {})

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"content_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert website copywriter and web designer. Generate complete, professional website content. Always respond with valid JSON only, no markdown."
        )
        chat.with_model("openai", "gpt-4o")

        prompt = f"""Generate complete website content for this business as a JSON object:
Business Name: {business_info.get('name', 'My Business')}
Business Type: {business_info.get('type', 'startup')}
Description: {business_info.get('description', '')}
Target Audience: {business_info.get('target_audience', 'general')}
Services: {business_info.get('services', '')}
Brand Tone: {business_info.get('tone', 'professional')}
Contact Email: {business_info.get('email', '')}
Phone: {business_info.get('phone', '')}

Return ONLY this JSON structure:
{{
  "hero": {{"headline": "...", "subheadline": "...", "cta_text": "Get Started"}},
  "about": {{"title": "About Us", "description": "...", "mission": "..."}},
  "services": [{{"name": "...", "description": "...", "price": "$XX"}}],
  "pricing": {{"plans": [{{"name": "Basic", "price": "$XX/mo", "features": ["..."]}}]}},
  "testimonials": [{{"name": "...", "role": "...", "text": "..."}}],
  "contact": {{"email": "...", "phone": "...", "address": "..."}},
  "seo": {{"title": "...", "description": "...", "keywords": ["..."]}},
  "tagline": "...",
  "brand_colors": {{"primary": "#...", "secondary": "#..."}}
}}"""

        msg = UserMessage(text=prompt)
        response_text = await chat.send_message(msg)

        # Debit wallet
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -5}}
        )
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "type": "debit",
            "amount": 5,
            "description": "AI content generation",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        # Parse JSON from response
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            content = json.loads(cleaned)
        except json.JSONDecodeError:
            content = {"raw_content": response_text}

        return {"content": content, "status": "success"}

    except Exception as e:
        logger.error(f"AI content generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/generate-questions")
async def generate_questions(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    business_type = body.get("business_type", "startup")
    current_info = body.get("current_info", {})

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"questions_{uuid.uuid4().hex[:8]}",
            system_message="You are a smart business consultant. Ask targeted questions to build a website. Respond with JSON only."
        )
        chat.with_model("openai", "gpt-4o")

        prompt = f"""Given this business type: {business_type}
And what we know so far: {json.dumps(current_info)}

Generate 3-5 smart follow-up questions to gather more info for building their website.
Return ONLY JSON: {{"questions": [{{"id": "q1", "text": "...", "type": "text|select", "options": ["..."] }}]}}"""

        msg = UserMessage(text=prompt)
        response_text = await chat.send_message(msg)

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            questions = json.loads(cleaned)
        except json.JSONDecodeError:
            questions = {"questions": [
                {"id": "q1", "text": "What is your business name?", "type": "text"},
                {"id": "q2", "text": "Who is your target audience?", "type": "text"},
                {"id": "q3", "text": "What services or products do you offer?", "type": "text"},
                {"id": "q4", "text": "What is your brand tone?", "type": "select", "options": ["Professional", "Casual", "Fun", "Luxury", "Technical"]},
                {"id": "q5", "text": "What are your contact details?", "type": "text"}
            ]}

        return questions

    except Exception as e:
        logger.error(f"AI question generation failed: {e}")
        return {"questions": [
            {"id": "q1", "text": "What is your business name?", "type": "text"},
            {"id": "q2", "text": "Who is your target audience?", "type": "text"},
            {"id": "q3", "text": "What services or products do you offer?", "type": "text"},
            {"id": "q4", "text": "What is your brand tone?", "type": "select", "options": ["Professional", "Casual", "Fun", "Luxury", "Technical"]},
            {"id": "q5", "text": "What are your contact details (email, phone)?", "type": "text"}
        ]}

@api_router.post("/ai/chat")
async def ai_chat(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    message = body.get("message", "")
    context = body.get("context", {})

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"chat_{uuid.uuid4().hex[:8]}",
            system_message="You are LaunchPad AI assistant helping build websites. Be concise, helpful, and ask follow-up questions when needed. Keep responses under 100 words."
        )
        chat.with_model("openai", "gpt-4o")

        prompt = f"Business context: {json.dumps(context)}\n\nUser says: {message}"
        msg = UserMessage(text=prompt)
        response_text = await chat.send_message(msg)
        return {"response": response_text}

    except Exception as e:
        logger.error(f"AI chat failed: {e}")
        return {"response": "I'm having trouble connecting right now. Please try again in a moment."}

# ─── Media Generation ───

@api_router.post("/media/generate-logo")
async def generate_logo(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    business_name = body.get("business_name", "My Business")
    style = body.get("style", "modern minimalist")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"logo_{uuid.uuid4().hex[:8]}",
            system_message="You are a professional logo designer."
        )
        chat.with_model("gemini", "gemini-3-pro-image-preview")
        chat.with_params(modalities=["image", "text"])

        prompt = f"Create a professional {style} logo for a business called '{business_name}'. Clean, vector-style, suitable for a website header. White background, simple and memorable design."
        msg = UserMessage(text=prompt)
        text, images = await chat.send_message_multimodal_response(msg)

        # Debit wallet
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -10}}
        )
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "type": "debit",
            "amount": 10,
            "description": "Logo generation",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        image_data_list = []
        if images:
            for img in images:
                image_data_list.append({
                    "data": img["data"][:100] + "..." if len(img.get("data", "")) > 100 else img.get("data", ""),
                    "mime_type": img.get("mime_type", "image/png"),
                    "full_data": img["data"]
                })

        return {"images": image_data_list, "text": text or "", "status": "success"}

    except Exception as e:
        logger.error(f"Logo generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/media/generate-image")
async def generate_image(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    prompt_text = body.get("prompt", "professional product photo")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"img_{uuid.uuid4().hex[:8]}",
            system_message="You are a professional product photographer and graphic designer."
        )
        chat.with_model("gemini", "gemini-3-pro-image-preview")
        chat.with_params(modalities=["image", "text"])

        msg = UserMessage(text=prompt_text)
        text, images = await chat.send_message_multimodal_response(msg)

        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -5}}
        )
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "type": "debit",
            "amount": 5,
            "description": "Image generation",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        image_data_list = []
        if images:
            for img in images:
                image_data_list.append({
                    "data": img["data"],
                    "mime_type": img.get("mime_type", "image/png")
                })

        return {"images": image_data_list, "text": text or "", "status": "success"}

    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/generate-tagline")
async def generate_tagline(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    business_name = body.get("business_name", "")
    description = body.get("description", "")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"tagline_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert branding copywriter. Generate catchy taglines. Return JSON only."
        )
        chat.with_model("openai", "gpt-4o")

        prompt = f"""Generate 5 catchy taglines for: {business_name} - {description}
Return ONLY JSON: {{"taglines": ["tagline1", "tagline2", ...]}}"""

        msg = UserMessage(text=prompt)
        response_text = await chat.send_message(msg)

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            result = {"taglines": [f"{business_name} - Your Success Partner"]}

        return result

    except Exception as e:
        logger.error(f"Tagline generation failed: {e}")
        return {"taglines": [f"{business_name} - Innovation Meets Excellence"]}

# ─── GitHub Publish ───

@api_router.post("/github/publish")
async def publish_to_github(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    project_id = body.get("project_id")

    project = await db.projects.find_one(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if user.get("plan") != "premium":
        raise HTTPException(status_code=403, detail="Premium plan required to publish")

    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        raise HTTPException(status_code=500, detail="GitHub token not configured")

    try:
        from github import Github, InputGitTreeElement

        gh = Github(github_token)
        gh_user = gh.get_user()
        safe_name = project["name"].lower().replace(" ", "-").replace("_", "-")
        repo_name = body.get("repo_name", f"launchpad-{safe_name}")

        # Create repo
        try:
            repo = gh_user.create_repo(
                name=repo_name,
                description=f"Website for {project['name']} - Built with LaunchPad AI",
                auto_init=True,
                has_pages=True
            )
        except Exception as e:
            if "name already exists" in str(e).lower():
                repo = gh_user.get_repo(repo_name)
            else:
                raise

        content = project.get("content", {})
        biz_name = project.get("name", "My Business")
        hero = content.get("hero", {})
        about = content.get("about", {})
        services = content.get("services", [])
        contact_info = content.get("contact", {})
        seo = content.get("seo", {})

        # Generate HTML
        services_html = ""
        for svc in services[:6]:
            services_html += f"""
            <div class="service-card">
                <h3>{svc.get('name', 'Service')}</h3>
                <p>{svc.get('description', '')}</p>
                <span class="price">{svc.get('price', '')}</span>
            </div>"""

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{seo.get('title', biz_name)}</title>
    <meta name="description" content="{seo.get('description', '')}">
    <meta name="keywords" content="{', '.join(seo.get('keywords', []))}">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', sans-serif; color: #333; }}
        .hero {{ background: linear-gradient(135deg, #0033FF, #6366f1); color: white; padding: 80px 20px; text-align: center; }}
        .hero h1 {{ font-size: 3rem; margin-bottom: 1rem; }}
        .hero p {{ font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto 2rem; }}
        .hero .cta {{ background: white; color: #0033FF; padding: 14px 32px; border: none; font-size: 1.1rem; cursor: pointer; font-weight: bold; }}
        .section {{ padding: 60px 20px; max-width: 1000px; margin: 0 auto; }}
        .section h2 {{ font-size: 2rem; margin-bottom: 1rem; }}
        .services-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }}
        .service-card {{ border: 1px solid #e5e7eb; padding: 24px; }}
        .service-card h3 {{ margin-bottom: 8px; }}
        .price {{ color: #0033FF; font-weight: bold; }}
        .contact {{ background: #f9fafb; padding: 60px 20px; text-align: center; }}
        footer {{ background: #0a0a0a; color: white; padding: 40px 20px; text-align: center; }}
        footer p {{ opacity: 0.7; }}
    </style>
</head>
<body>
    <section class="hero">
        <h1>{hero.get('headline', biz_name)}</h1>
        <p>{hero.get('subheadline', about.get('description', ''))}</p>
        <button class="cta">{hero.get('cta_text', 'Get Started')}</button>
    </section>
    <section class="section">
        <h2>{about.get('title', 'About Us')}</h2>
        <p>{about.get('description', '')}</p>
        <p style="margin-top:12px;color:#6b7280;">{about.get('mission', '')}</p>
    </section>
    <section class="section">
        <h2>Our Services</h2>
        <div class="services-grid">{services_html}</div>
    </section>
    <section class="contact">
        <h2>Contact Us</h2>
        <p style="margin-top:12px;">Email: {contact_info.get('email', '')}</p>
        <p>Phone: {contact_info.get('phone', '')}</p>
        <p>{contact_info.get('address', '')}</p>
    </section>
    <footer>
        <p>&copy; 2026 {biz_name}. Built with LaunchPad AI.</p>
    </footer>
</body>
</html>"""

        # Push files
        import time
        time.sleep(2)  # Wait for repo init

        branch = repo.default_branch or "main"
        branch_ref = repo.get_git_ref(f"heads/{branch}")
        head_sha = branch_ref.object.sha
        current_commit = repo.get_git_commit(head_sha)

        blob = repo.create_git_blob(html_content, "utf-8")
        tree = repo.create_git_tree(
            [InputGitTreeElement(path="index.html", mode="100644", type="blob", sha=blob.sha)],
            current_commit.tree
        )
        new_commit = repo.create_git_commit(
            "Deploy website via LaunchPad AI", tree, [current_commit]
        )
        branch_ref.edit(new_commit.sha)

        # Enable GitHub Pages
        pages_url = f"https://{gh_user.login}.github.io/{repo_name}/"

        # Update project
        await db.projects.update_one(
            {"project_id": project_id},
            {"$set": {
                "published": True,
                "publish_url": pages_url,
                "repo_url": repo.html_url,
                "status": "published",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

        # Debit wallet for publishing
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"wallet_balance": -20}}
        )
        await db.wallet_transactions.insert_one({
            "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "type": "debit",
            "amount": 20,
            "description": f"Published {project['name']} to GitHub",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        gh.close()

        return {
            "status": "published",
            "repo_url": repo.html_url,
            "pages_url": pages_url,
            "repo_name": repo_name,
            "commit_sha": new_commit.sha
        }

    except Exception as e:
        logger.error(f"GitHub publish failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/github/status/{project_id}")
async def get_publish_status(project_id: str, request: Request):
    user = await get_current_user(request)
    project = await db.projects.find_one(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "published": project.get("published", False),
        "publish_url": project.get("publish_url", ""),
        "repo_url": project.get("repo_url", ""),
        "status": project.get("status", "draft")
    }

# ─── Include router & middleware ───

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
