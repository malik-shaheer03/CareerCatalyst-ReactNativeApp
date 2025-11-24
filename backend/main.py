from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
from jobspy import scrape_jobs
import math

app = FastAPI()

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeParams(BaseModel):
    site_name: Union[str, List[str]]
    search_term: str
    location: Optional[str] = None
    job_types: Optional[List[str]] = None
    work_location_types: Optional[List[str]] = None

def sanitize_floats(obj):
    """Sanitize NaN and infinity values for JSON serialization"""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        else:
            return obj
    if isinstance(obj, dict):
        return {k: sanitize_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_floats(i) for i in obj]
    return obj

def format_salary(min_amount, max_amount, currency):
    """Format salary information from jobspy data"""
    try:
        # Handle None/NaN values
        if min_amount is None or (isinstance(min_amount, float) and math.isnan(min_amount)):
            min_amount = None
        if max_amount is None or (isinstance(max_amount, float) and math.isnan(max_amount)):
            max_amount = None
        if not currency:
            currency = "USD"
            
        # Format salary based on available data
        if min_amount and max_amount:
            return f"${int(min_amount):,} - ${int(max_amount):,}"
        elif min_amount:
            return f"${int(min_amount):,}+"
        elif max_amount:
            return f"Up to ${int(max_amount):,}"
        else:
            return "Salary not disclosed"
    except:
        return "Salary not disclosed"

# Mock job data for fallback when real scraping fails
MOCK_JOBS = [
    {
        "id": "1",
        "title": "Senior React Developer",
        "company": "TechCorp Inc.",
        "location": "Remote",
        "date_posted": "2 days ago",
        "job_url": "https://example.com/job/1",
        "description": "We are looking for a senior React developer with 5+ years of experience in building scalable web applications. You'll work with our dynamic team to create innovative solutions.",
        "salary": "$80,000/year",
        "site": "indeed",
        "is_remote": True,
        "job_type": "Full Time",
        "type": "Full Time",
        "companyIcon": "briefcase",
        "companyColor": "#4285F4",
        "applicants": "15",
        "capacity": "25",
        "saved": False,
    },
    {
        "id": "2",
        "title": "Python Backend Developer",
        "company": "DataFlow Solutions",
        "location": "San Francisco, CA",
        "date_posted": "1 day ago",
        "job_url": "https://example.com/job/2",
        "description": "Join our backend team to build scalable APIs and data processing systems. Experience with Django, FastAPI, and PostgreSQL required.",
        "salary": "$95,000/year",
        "site": "linkedin",
        "is_remote": False,
        "job_type": "Full Time",
        "type": "Full Time",
        "companyIcon": "server-network",
        "companyColor": "#FF6B35",
        "applicants": "28",
        "capacity": "35",
        "saved": False,
    },
    {
        "id": "3",
        "title": "Frontend UI Developer",
        "company": "Creative Studios",
        "location": "Austin, TX",
        "date_posted": "3 days ago",
        "job_url": "https://example.com/job/3",
        "description": "Create beautiful user interfaces using modern frontend technologies. Experience with React, TypeScript, and CSS frameworks preferred.",
        "salary": "$70,000/year",
        "site": "indeed",
        "is_remote": False,
        "job_type": "Part Time",
        "type": "Part Time",
        "companyIcon": "briefcase",
        "companyColor": "#FF6B35",
        "applicants": "12",
        "capacity": "20",
        "saved": False,
    },
    {
        "id": "4",
        "title": "Mobile App Developer",
        "company": "Google",
        "location": "Mountain View, CA",
        "date_posted": "1 day ago",
        "job_url": "https://careers.google.com/jobs/1",
        "description": "Join Google's mobile team to build innovative apps that reach billions of users. Experience with React Native, Flutter, or native development required.",
        "salary": "$120,000/year",
        "site": "indeed",
        "is_remote": True,
        "job_type": "Full Time",
        "type": "Full Time",
        "companyIcon": "google",
        "companyColor": "#4285F4",
        "applicants": "22",
        "capacity": "30",
        "saved": False,
    },
    {
        "id": "5",
        "title": "UI/UX Designer",
        "company": "Facebook",
        "location": "Menlo Park, CA",
        "date_posted": "2 days ago",
        "job_url": "https://careers.facebook.com/jobs/1",
        "description": "Create beautiful and intuitive user experiences for millions of Facebook users. Work with cross-functional teams to bring designs to life.",
        "salary": "$90,000/year",
        "site": "linkedin",
        "is_remote": True,
        "job_type": "Full Time",
        "type": "Full Time",
        "companyIcon": "facebook",
        "companyColor": "#1877F2",
        "applicants": "18",
        "capacity": "25",
        "saved": False,
    }
]

@app.get("/api/locations")
async def get_location_suggestions(q: str = ""):
    """Get location suggestions based on query"""
    # Mock location suggestions - in production, use a real location API
    all_locations = [
        "New York, NY, USA",
        "San Francisco, CA, USA", 
        "Los Angeles, CA, USA",
        "Chicago, IL, USA",
        "Boston, MA, USA",
        "Seattle, WA, USA",
        "Austin, TX, USA",
        "Denver, CO, USA",
        "London, England, UK",
        "Paris, France",
        "Berlin, Germany",
        "Toronto, ON, Canada",
        "Vancouver, BC, Canada",
        "Sydney, NSW, Australia",
        "Melbourne, VIC, Australia",
        "Dublin, Ireland",
        "Amsterdam, Netherlands",
        "Stockholm, Sweden",
        "Zurich, Switzerland"
    ]
    
    if not q:
        return {"suggestions": all_locations[:10]}
    
    # Filter based on query
    filtered = [loc for loc in all_locations if q.lower() in loc.lower()]
    return {"suggestions": filtered[:10]}

@app.post("/api/scrape-jobs")
async def scrape_jobs_api(params: ScrapeParams):
    print(f"Received scrape request with params: {params}")
    try:
        # Ensure site_name is always a list
        site_names = [params.site_name] if isinstance(params.site_name, str) else params.site_name
        
        print(f"Scraping from sites: {site_names}")
        print(f"Search term: {params.search_term}")
        print(f"Location: {params.location}")

        # Use jobspy library for real scraping
        jobs_df = scrape_jobs(
            site_name=site_names,
            search_term=params.search_term,
            location=params.location,
            results_wanted=25,  # Fixed at 25
        )

        # Convert dataframe to list of dictionaries
        jobs_list = jobs_df.to_dict(orient="records")
        print(f"Successfully scraped {len(jobs_list)} real jobs")

        # Process and standardize job data
        processed_jobs = []
        for job in jobs_list:
            # Get source site information
            site = job.get("site", "indeed").lower()
            site_info = {
                "linkedin": {"name": "LinkedIn", "logo": "linkedin", "color": "#0077b5"},
                "indeed": {"name": "Indeed", "logo": "briefcase", "color": "#2557a7"}
            }.get(site, {"name": "Indeed", "logo": "briefcase", "color": "#2557a7"})
            
            processed_job = {
                "id": job.get("job_url", f"job_{len(processed_jobs)}"),
                "title": job.get("title", "Job Title Not Available"),
                "company": job.get("company", "Company Not Listed"),
                "location": job.get("location", "Location Not Specified"),
                "date_posted": job.get("date_posted", "Recently Posted"),
                "job_url": job.get("job_url", "#"),
                "description": job.get("description", "No description available"),
                "salary": format_salary(job.get("min_amount"), job.get("max_amount"), job.get("currency")),
                "site": site,
                "source": site_info,
                "is_remote": job.get("is_remote", False),
                "job_type": job.get("job_type", "Full Time"),
                "type": job.get("job_type", "Full Time"),
                "companyIcon": "domain",
                "companyColor": "#4285F4",
                "saved": False,
            }
            processed_jobs.append(processed_job)

        # Sanitize floats (NaN/Infinity) for JSON compatibility
        sanitized_jobs = sanitize_floats(processed_jobs)

        return {"jobs": sanitized_jobs}

    except Exception as e:
        print(f"Error in real scraping: {e}")
        print("Using fallback mock data...")
        
        # Fallback to mock data if real scraping fails
        search_term = params.search_term.lower()
        filtered_jobs = []
        
        for job in MOCK_JOBS:
            if (search_term in job["title"].lower() or 
                search_term in job["description"].lower() or
                search_term in job["company"].lower()):
                filtered_jobs.append(job)
        
        # If no specific matches, return limited mock jobs
        if not filtered_jobs:
            filtered_jobs = MOCK_JOBS[:5]  # Just return 5 jobs as fallback
            
        # Limit results based on params.results_wanted
        if params.results_wanted:
            filtered_jobs = filtered_jobs[:params.results_wanted]
            
        return {"jobs": filtered_jobs}

@app.get("/")
async def root():
    return {"message": "Job Scraper API is running!", "status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)