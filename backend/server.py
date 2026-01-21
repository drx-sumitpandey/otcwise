from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from PIL import Image
import pytesseract
import io
import re
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'otcwise-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Emergent LLM Key
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Emergency keywords
EMERGENCY_KEYWORDS = [
    'chest pain', 'difficulty breathing', 'seizure', 'severe bleeding',
    'loss of consciousness', 'unconscious', 'not breathing', 'choking',
    'heart attack', 'stroke', 'severe burn', 'poisoning', 'overdose'
]

# Forbidden output words
FORBIDDEN_WORDS = [
    'diagnose', 'diagnosis', 'prescribe', 'prescription', 'cure', 'guaranteed',
    'you have', 'your condition is', 'definitely', 'certainly will'
]

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    age_confirmed: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ConsentAccept(BaseModel):
    age_confirmed: bool
    consent_version: str = "1.0"

class ConsentStatus(BaseModel):
    age_confirmed: bool
    disclaimer_accepted: bool
    consent_version: str

class FirstAidTopic(BaseModel):
    id: str
    title: str
    description: str
    icon: str

class FirstAidStep(BaseModel):
    step_order: int
    instruction: str

class FirstAidDetail(BaseModel):
    id: str
    title: str
    description: str
    steps: List[FirstAidStep]
    emergency_note: str

class MedicineSearch(BaseModel):
    query: str

class MedicineInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand_name: Optional[str] = None
    generic_name: str
    drug_class: Optional[str] = None
    indications: List[str] = []
    standard_adult_dose: Optional[str] = None
    contraindications: List[str] = []
    interactions: List[str] = []
    adverse_effects: List[str] = []
    cautions: List[str] = []

class SymptomRequest(BaseModel):
    symptoms: List[str]

class SymptomResponse(BaseModel):
    summary: str
    possible_associations: List[str]
    risk_level: str
    next_steps: List[str]
    disclaimer: str
    emergency: bool = False

class LocationQuery(BaseModel):
    lat: float
    lng: float

class Pharmacy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    phone: str
    distance: Optional[float] = None

class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    specialty: str
    address: str
    latitude: float
    longitude: float
    phone: str
    distance: Optional[float] = None

class FeedbackSubmit(BaseModel):
    type: str  # Feedback, Error, AdverseEffect
    message: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_jwt_token(token)
    user_id = payload.get('user_id')
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def detect_emergency(symptoms: List[str]) -> bool:
    """Detect emergency keywords in symptoms"""
    symptoms_text = ' '.join(symptoms).lower()
    return any(keyword in symptoms_text for keyword in EMERGENCY_KEYWORDS)

def check_output_compliance(text: str) -> bool:
    """Check if AI output contains forbidden words"""
    text_lower = text.lower()
    return not any(word in text_lower for word in FORBIDDEN_WORDS)

async def call_ai_for_symptoms(symptoms: List[str]) -> dict:
    """Call Claude AI for symptom analysis with safety filters"""
    
    # Check for emergency
    if detect_emergency(symptoms):
        return {
            'emergency': True,
            'summary': 'Emergency situation detected',
            'possible_associations': [],
            'risk_level': 'High',
            'next_steps': ['Call emergency services immediately', 'Seek immediate medical attention'],
            'disclaimer': 'This is an emergency. Please contact emergency services.'
        }
    
    # Prepare prompt
    symptoms_str = ', '.join(symptoms)
    system_message = """You are an educational health information assistant for OTCwise. 
    You provide NON-DIAGNOSTIC educational insights only. 
    NEVER diagnose conditions, prescribe medications, or use certainty language.
    Always use phrases like 'may be associated with', 'could be linked to', 'it may help to consider'.
    Categorize risk as Low, Moderate, or High and suggest appropriate next steps."""
    
    prompt = f"""Given these reported symptoms: {symptoms_str}
    
    Provide:
    1. A brief educational summary (2-3 sentences)
    2. Possible associations (list 2-4 general conditions these MAY be associated with)
    3. Risk level (Low/Moderate/High)
    4. Next steps (self-care, pharmacist consultation, doctor visit, or urgent care)
    
    Remember: Be calm, educational, non-diagnostic. Never say 'you have' or conclude a disease."""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        )
        chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response
        lines = response.strip().split('\n')
        summary = ''
        associations = []
        risk_level = 'Moderate'
        next_steps = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if 'summary' in line.lower():
                current_section = 'summary'
            elif 'association' in line.lower():
                current_section = 'associations'
            elif 'risk' in line.lower():
                current_section = 'risk'
                if 'low' in line.lower():
                    risk_level = 'Low'
                elif 'high' in line.lower():
                    risk_level = 'High'
            elif 'next step' in line.lower():
                current_section = 'steps'
            elif current_section == 'summary' and not line.startswith(('1.', '2.', '3.', '4.', '-', '*')):
                summary += line + ' '
            elif current_section == 'associations' and (line.startswith(('-', '*')) or line[0].isdigit()):
                associations.append(line.lstrip('- *0123456789. '))
            elif current_section == 'steps' and (line.startswith(('-', '*')) or line[0].isdigit()):
                next_steps.append(line.lstrip('- *0123456789. '))
        
        if not summary:
            summary = response[:200]
        if not associations:
            associations = ['General health concerns that may require professional evaluation']
        if not next_steps:
            next_steps = ['Consider consulting a healthcare professional for personalized advice']
        
        # Compliance check
        if not check_output_compliance(response):
            raise HTTPException(status_code=500, detail="AI output failed compliance check")
        
        return {
            'emergency': False,
            'summary': summary.strip(),
            'possible_associations': associations[:4],
            'risk_level': risk_level,
            'next_steps': next_steps[:4],
            'disclaimer': 'This information is educational only and does not replace professional medical advice.'
        }
    
    except Exception as e:
        logger.error(f"AI call failed: {e}")
        return {
            'emergency': False,
            'summary': 'Unable to process symptoms at this time.',
            'possible_associations': ['Please consult a healthcare professional'],
            'risk_level': 'Moderate',
            'next_steps': ['Visit a doctor or pharmacist for proper evaluation'],
            'disclaimer': 'This information is educational only and does not replace professional medical advice.'
        }

# Auth Endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    if not user_data.age_confirmed:
        raise HTTPException(status_code=400, detail="Must be 18+ to register")
    
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        'id': user_id,
        'email': user_data.email,
        'password_hash': hash_password(user_data.password),
        'is_active': True,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'last_login': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create consent record
    consent_doc = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'age_confirmed': user_data.age_confirmed,
        'disclaimer_accepted': True,
        'consent_version': '1.0',
        'accepted_at': datetime.now(timezone.utc).isoformat()
    }
    await db.user_consent.insert_one(consent_doc)
    
    token = create_jwt_token(user_id)
    return {'token': token, 'user_id': user_id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    await db.users.update_one(
        {'email': credentials.email},
        {'$set': {'last_login': datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_jwt_token(user['id'])
    return {'token': token, 'user_id': user['id']}

# Consent Endpoints
@api_router.get("/consent/status", response_model=ConsentStatus)
async def get_consent_status(user = Depends(get_current_user)):
    consent = await db.user_consent.find_one({'user_id': user['id']}, {'_id': 0})
    if not consent:
        return ConsentStatus(
            age_confirmed=False,
            disclaimer_accepted=False,
            consent_version='1.0'
        )
    return ConsentStatus(**consent)

@api_router.post("/consent/accept")
async def accept_consent(consent: ConsentAccept, user = Depends(get_current_user)):
    consent_doc = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'age_confirmed': consent.age_confirmed,
        'disclaimer_accepted': True,
        'consent_version': consent.consent_version,
        'accepted_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_consent.update_one(
        {'user_id': user['id']},
        {'$set': consent_doc},
        upsert=True
    )
    
    return {'message': 'Consent recorded'}

# First Aid Endpoints
@api_router.get("/first-aid/topics", response_model=List[FirstAidTopic])
async def get_first_aid_topics():
    topics = await db.first_aid_topics.find({}, {'_id': 0}).to_list(100)
    if not topics:
        # Seed data
        default_topics = [
            {'id': str(uuid.uuid4()), 'title': 'Burns', 'description': 'Treatment for minor and major burns', 'icon': 'flame'},
            {'id': str(uuid.uuid4()), 'title': 'Bleeding', 'description': 'How to stop and manage bleeding', 'icon': 'droplet'},
            {'id': str(uuid.uuid4()), 'title': 'Choking', 'description': 'Emergency response for choking', 'icon': 'wind'},
            {'id': str(uuid.uuid4()), 'title': 'Fractures', 'description': 'Managing broken bones', 'icon': 'bone'},
            {'id': str(uuid.uuid4()), 'title': 'Poisoning', 'description': 'What to do in poisoning cases', 'icon': 'alert-triangle'},
        ]
        await db.first_aid_topics.insert_many(default_topics)
        topics = default_topics
    return topics

@api_router.get("/first-aid/{topic_id}", response_model=FirstAidDetail)
async def get_first_aid_detail(topic_id: str):
    topic = await db.first_aid_topics.find_one({'id': topic_id}, {'_id': 0})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    steps = await db.first_aid_steps.find({'topic_id': topic_id}, {'_id': 0}).sort('step_order', 1).to_list(100)
    
    # If no steps, create default ones
    if not steps:
        default_steps = [
            {'id': str(uuid.uuid4()), 'topic_id': topic_id, 'step_order': 1, 'instruction': 'Assess the situation and ensure safety for yourself and the person.'},
            {'id': str(uuid.uuid4()), 'topic_id': topic_id, 'step_order': 2, 'instruction': 'Call emergency services if the situation is severe.'},
            {'id': str(uuid.uuid4()), 'topic_id': topic_id, 'step_order': 3, 'instruction': 'Follow specific first aid procedures for this condition.'},
        ]
        await db.first_aid_steps.insert_many(default_steps)
        steps = default_steps
    
    return FirstAidDetail(
        id=topic['id'],
        title=topic['title'],
        description=topic['description'],
        steps=[FirstAidStep(**step) for step in steps],
        emergency_note='If condition worsens or you\'re unsure, seek professional medical help immediately.'
    )

# Medicine Endpoints
@api_router.get("/medicines/search")
async def search_medicines(query: str):
    medicines = await db.medicines.find(
        {'$or': [
            {'brand_name': {'$regex': query, '$options': 'i'}},
            {'generic_name': {'$regex': query, '$options': 'i'}}
        ]},
        {'_id': 0}
    ).to_list(20)
    
    if not medicines:
        # Seed some sample data
        sample_medicines = [
            {
                'id': str(uuid.uuid4()),
                'brand_name': 'Tylenol',
                'generic_name': 'Acetaminophen',
                'drug_class': 'Analgesic, Antipyretic'
            },
            {
                'id': str(uuid.uuid4()),
                'brand_name': 'Advil',
                'generic_name': 'Ibuprofen',
                'drug_class': 'NSAID'
            }
        ]
        await db.medicines.insert_many(sample_medicines)
        return sample_medicines
    
    return medicines

@api_router.get("/medicines/{medicine_id}", response_model=MedicineInfo)
async def get_medicine_info(medicine_id: str):
    medicine = await db.medicines.find_one({'id': medicine_id}, {'_id': 0})
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Fetch related data
    indications = await db.medicine_indications.find({'medicine_id': medicine_id}, {'_id': 0}).to_list(100)
    contraindications = await db.medicine_contraindications.find({'medicine_id': medicine_id}, {'_id': 0}).to_list(100)
    interactions = await db.medicine_interactions.find({'medicine_id': medicine_id}, {'_id': 0}).to_list(100)
    adverse_effects = await db.medicine_adverse_effects.find({'medicine_id': medicine_id}, {'_id': 0}).to_list(100)
    cautions = await db.medicine_cautions.find({'medicine_id': medicine_id}, {'_id': 0}).to_list(100)
    
    medicine['indications'] = [item['indication'] for item in indications] if indications else ['General pain relief']
    medicine['contraindications'] = [item['contraindication'] for item in contraindications] if contraindications else ['Known allergy to this medication']
    medicine['interactions'] = [item['interaction'] for item in interactions] if interactions else ['May interact with other medications']
    medicine['adverse_effects'] = [item['adverse_effect'] for item in adverse_effects] if adverse_effects else ['Nausea, dizziness (rare)']
    medicine['cautions'] = [item['caution'] for item in cautions] if cautions else ['Use as directed on package']
    medicine['standard_adult_dose'] = medicine.get('standard_adult_dose', 'Refer to package instructions (reference only, not personalized)')
    
    return MedicineInfo(**medicine)

@api_router.post("/medicines/identify")
async def identify_medicine(file: UploadFile = File(...), user = Depends(get_current_user)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # OCR
        text = pytesseract.image_to_string(image)
        
        # Search for medicine names in extracted text
        words = text.split()
        for word in words:
            if len(word) > 3:
                medicines = await db.medicines.find(
                    {'$or': [
                        {'brand_name': {'$regex': word, '$options': 'i'}},
                        {'generic_name': {'$regex': word, '$options': 'i'}}
                    ]},
                    {'_id': 0}
                ).to_list(5)
                
                if medicines:
                    return {'medicines': medicines, 'extracted_text': text[:200]}
        
        return {'medicines': [], 'extracted_text': text[:200], 'message': 'No medicines identified'}
    
    except Exception as e:
        logger.error(f"Image identification failed: {e}")
        raise HTTPException(status_code=400, detail="Failed to process image")

# Symptom Check Endpoint
@api_router.post("/symptoms/check", response_model=SymptomResponse)
async def check_symptoms(symptom_request: SymptomRequest, user = Depends(get_current_user)):
    # Check consent
    consent = await db.user_consent.find_one({'user_id': user['id']}, {'_id': 0})
    if not consent or not consent.get('age_confirmed'):
        raise HTTPException(status_code=403, detail="Consent required")
    
    result = await call_ai_for_symptoms(symptom_request.symptoms)
    
    # Log audit
    audit_log = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'input_summary': ', '.join(symptom_request.symptoms),
        'output_summary': result['summary'],
        'emergency_triggered': result.get('emergency', False),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.ai_audit_logs.insert_one(audit_log)
    
    # Store symptom check
    symptom_check = {
        'id': str(uuid.uuid4()),
        'user_id': user['id'],
        'symptoms': symptom_request.symptoms,
        'risk_level': result['risk_level'],
        'summary': result['summary'],
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.symptom_checks.insert_one(symptom_check)
    
    return SymptomResponse(**result)

# Location Endpoints
@api_router.get("/locator/pharmacies")
async def get_pharmacies(lat: float, lng: float):
    # For MVP, return sample data. In production, integrate with real location service
    pharmacies = await db.pharmacies.find({}, {'_id': 0}).to_list(20)
    
    if not pharmacies:
        # Seed sample data
        sample_pharmacies = [
            {
                'id': str(uuid.uuid4()),
                'name': 'City Pharmacy',
                'address': '123 Main Street',
                'latitude': lat + 0.01,
                'longitude': lng + 0.01,
                'phone': '+1-555-0100'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Health Plus Pharmacy',
                'address': '456 Oak Avenue',
                'latitude': lat - 0.01,
                'longitude': lng - 0.01,
                'phone': '+1-555-0200'
            }
        ]
        await db.pharmacies.insert_many(sample_pharmacies)
        pharmacies = sample_pharmacies
    
    return pharmacies

@api_router.get("/locator/doctors")
async def get_doctors(lat: float, lng: float):
    doctors = await db.doctors.find({}, {'_id': 0}).to_list(20)
    
    if not doctors:
        # Seed sample data
        sample_doctors = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Sarah Johnson',
                'specialty': 'General Practice',
                'address': '789 Elm Street',
                'latitude': lat + 0.02,
                'longitude': lng + 0.02,
                'phone': '+1-555-0300'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Dr. Michael Chen',
                'specialty': 'Family Medicine',
                'address': '321 Pine Road',
                'latitude': lat - 0.02,
                'longitude': lng - 0.02,
                'phone': '+1-555-0400'
            }
        ]
        await db.doctors.insert_many(sample_doctors)
        doctors = sample_doctors
    
    return doctors

# Feedback Endpoint
@api_router.post("/feedback")
async def submit_feedback(feedback: FeedbackSubmit):
    feedback_doc = {
        'id': str(uuid.uuid4()),
        'type': feedback.type,
        'message': feedback.message,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.feedback.insert_one(feedback_doc)
    return {'message': 'Feedback received'}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()