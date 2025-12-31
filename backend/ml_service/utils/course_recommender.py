"""
Course Recommendation System

Recommends relevant courses from Coursera and Udemy based on career paths and skill gaps.
"""

import re
from typing import List, Dict, Any


class CourseRecommender:
    """Recommends courses from Coursera and Udemy"""
    
    # Comprehensive course database with real Coursera and Udemy courses
    COURSE_DATABASE = {
        # Frontend Development
        "frontend": [
            {
                "platform": "Coursera",
                "name": "Meta Front-End Developer Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
                "description": "Learn to create responsive websites using React, HTML, CSS, and JavaScript from Meta."
            },
            {
                "platform": "Udemy",
                "name": "The Complete 2024 Web Development Bootcamp",
                "link": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
                "description": "Master full-stack web development with HTML, CSS, JavaScript, React, Node.js, and more."
            },
            {
                "platform": "Coursera",
                "name": "HTML, CSS, and Javascript for Web Developers",
                "link": "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
                "description": "Learn the fundamentals of web development from Johns Hopkins University."
            }
        ],
        
        # Backend Development
        "backend": [
            {
                "platform": "Coursera",
                "name": "IBM Back-End Development Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/ibm-backend-development",
                "description": "Master back-end development with Python, Django, Node.js, and cloud native technologies."
            },
            {
                "platform": "Udemy",
                "name": "Node.js, Express, MongoDB & More: The Complete Bootcamp",
                "link": "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/",
                "description": "Build fast, scalable and secure RESTful APIs with Node.js, Express and MongoDB."
            },
            {
                "platform": "Coursera",
                "name": "Building Scalable Java Microservices with Spring Boot",
                "link": "https://www.coursera.org/learn/google-cloud-java-spring",
                "description": "Learn to build and deploy Java microservices using Spring Boot on Google Cloud."
            }
        ],
        
        # Full Stack Development
        "fullstack": [
            {
                "platform": "Coursera",
                "name": "IBM Full Stack Software Developer Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer",
                "description": "Become a full-stack developer with skills in HTML, CSS, JavaScript, React, Node.js, and cloud."
            },
            {
                "platform": "Udemy",
                "name": "The Complete JavaScript Course: From Zero to Expert",
                "link": "https://www.udemy.com/course/the-complete-javascript-course/",
                "description": "Master JavaScript with projects, challenges, and theory from beginner to advanced level."
            },
            {
                "platform": "Coursera",
                "name": "Full-Stack Web Development with React Specialization",
                "link": "https://www.coursera.org/specializations/full-stack-react",
                "description": "Master front-end and back-end development using React, React Native, and Node.js."
            }
        ],
        
        # Mobile Development
        "mobile": [
            {
                "platform": "Coursera",
                "name": "Meta React Native Specialization",
                "link": "https://www.coursera.org/specializations/meta-react-native",
                "description": "Build cross-platform mobile apps with React Native from Meta."
            },
            {
                "platform": "Udemy",
                "name": "React Native - The Practical Guide",
                "link": "https://www.udemy.com/course/react-native-the-practical-guide/",
                "description": "Build native iOS and Android apps with React Native and master mobile development."
            },
            {
                "platform": "Coursera",
                "name": "Android App Development Specialization",
                "link": "https://www.coursera.org/specializations/android-app-development",
                "description": "Learn to develop Android apps with Kotlin and Jetpack Compose."
            }
        ],
        
        # Data Science & ML
        "datascience": [
            {
                "platform": "Coursera",
                "name": "IBM Data Science Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/ibm-data-science",
                "description": "Master data science with Python, SQL, machine learning, and data visualization."
            },
            {
                "platform": "Udemy",
                "name": "Machine Learning A-Z: AI, Python & R",
                "link": "https://www.udemy.com/course/machinelearning/",
                "description": "Learn Machine Learning algorithms with Python and R from top data scientists."
            },
            {
                "platform": "Coursera",
                "name": "Deep Learning Specialization",
                "link": "https://www.coursera.org/specializations/deep-learning",
                "description": "Master deep learning with neural networks, CNNs, RNNs, and transformers by Andrew Ng."
            }
        ],
        
        # DevOps & Cloud
        "devops": [
            {
                "platform": "Coursera",
                "name": "Google Cloud DevOps Engineer Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/sre-devops-engineer-google-cloud",
                "description": "Learn DevOps practices and tools like Kubernetes, Docker, and CI/CD on Google Cloud."
            },
            {
                "platform": "Udemy",
                "name": "Docker & Kubernetes: The Practical Guide",
                "link": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
                "description": "Master Docker and Kubernetes from the ground up with hands-on projects."
            },
            {
                "platform": "Coursera",
                "name": "AWS Cloud Solutions Architect Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
                "description": "Design and deploy scalable cloud solutions on Amazon Web Services."
            }
        ],
        
        # Data Engineering
        "dataengineering": [
            {
                "platform": "Coursera",
                "name": "IBM Data Engineering Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/ibm-data-engineer",
                "description": "Master data pipelines, ETL, databases, and big data tools like Apache Spark and Hadoop."
            },
            {
                "platform": "Udemy",
                "name": "The Ultimate Hands-On Hadoop",
                "link": "https://www.udemy.com/course/the-ultimate-hands-on-hadoop-tame-your-big-data/",
                "description": "Learn Hadoop, MapReduce, HDFS, Spark, and other big data technologies."
            },
            {
                "platform": "Coursera",
                "name": "Data Engineering, Big Data, and Machine Learning on GCP",
                "link": "https://www.coursera.org/specializations/gcp-data-machine-learning",
                "description": "Build data pipelines and ML models on Google Cloud Platform."
            }
        ],
        
        # Cybersecurity
        "cybersecurity": [
            {
                "platform": "Coursera",
                "name": "Google Cybersecurity Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/google-cybersecurity",
                "description": "Learn cybersecurity fundamentals, network security, and threat detection from Google."
            },
            {
                "platform": "Udemy",
                "name": "The Complete Cyber Security Course: Network Security",
                "link": "https://www.udemy.com/course/network-security-course/",
                "description": "Master network security, firewalls, VPNs, and security protocols."
            },
            {
                "platform": "Coursera",
                "name": "IBM Cybersecurity Analyst Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst",
                "description": "Develop skills in security frameworks, network defense, and incident response."
            }
        ],
        
        # AI & Deep Learning
        "ai": [
            {
                "platform": "Coursera",
                "name": "AI For Everyone",
                "link": "https://www.coursera.org/learn/ai-for-everyone",
                "description": "Understand AI concepts, applications, and how to integrate AI into your organization."
            },
            {
                "platform": "Udemy",
                "name": "TensorFlow Developer Certificate: Zero to Mastery",
                "link": "https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/",
                "description": "Become a TensorFlow certified developer and build AI applications."
            },
            {
                "platform": "Coursera",
                "name": "Natural Language Processing Specialization",
                "link": "https://www.coursera.org/specializations/natural-language-processing",
                "description": "Master NLP techniques including sentiment analysis, translation, and chatbots."
            }
        ],
        
        # QA & Testing
        "qa": [
            {
                "platform": "Coursera",
                "name": "Software Testing and Automation Specialization",
                "link": "https://www.coursera.org/specializations/software-testing-automation",
                "description": "Learn automated testing, test-driven development, and quality assurance practices."
            },
            {
                "platform": "Udemy",
                "name": "Selenium WebDriver with Java - Basics to Advanced",
                "link": "https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/",
                "description": "Master Selenium automation testing with Java from scratch to expert level."
            },
            {
                "platform": "Coursera",
                "name": "Introduction to Software Testing",
                "link": "https://www.coursera.org/learn/introduction-software-testing",
                "description": "Learn software testing fundamentals, techniques, and best practices."
            }
        ],
        
        # UI/UX Design
        "uiux": [
            {
                "platform": "Coursera",
                "name": "Google UX Design Professional Certificate",
                "link": "https://www.coursera.org/professional-certificates/google-ux-design",
                "description": "Master UX design fundamentals, prototyping, and user research from Google."
            },
            {
                "platform": "Udemy",
                "name": "UI/UX Design Bootcamp: Figma, Sketch, Photoshop, XD",
                "link": "https://www.udemy.com/course/ui-ux-web-design-using-figma/",
                "description": "Learn UI/UX design with industry-standard tools like Figma, Sketch, and Adobe XD."
            },
            {
                "platform": "Coursera",
                "name": "Interaction Design Specialization",
                "link": "https://www.coursera.org/specializations/interaction-design",
                "description": "Master interaction design principles and create engaging user experiences."
            }
        ],
        
        # Product Management
        "productmanagement": [
            {
                "platform": "Coursera",
                "name": "Digital Product Management Specialization",
                "link": "https://www.coursera.org/specializations/uva-darden-digital-product-management",
                "description": "Learn product strategy, agile development, and product lifecycle management."
            },
            {
                "platform": "Udemy",
                "name": "Become a Product Manager: Learn the Skills & Get the Job",
                "link": "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/",
                "description": "Master product management from ideation to launch with real-world examples."
            },
            {
                "platform": "Coursera",
                "name": "Real-World Product Management Specialization",
                "link": "https://www.coursera.org/specializations/real-world-product-management",
                "description": "Learn product management strategies from industry experts at Advancing Women in Tech."
            }
        ],
        
        # Blockchain
        "blockchain": [
            {
                "platform": "Coursera",
                "name": "Blockchain Specialization",
                "link": "https://www.coursera.org/specializations/blockchain",
                "description": "Master blockchain technology, smart contracts, and decentralized applications."
            },
            {
                "platform": "Udemy",
                "name": "Ethereum and Solidity: The Complete Developer's Guide",
                "link": "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/",
                "description": "Build blockchain applications and smart contracts with Ethereum and Solidity."
            },
            {
                "platform": "Coursera",
                "name": "Bitcoin and Cryptocurrency Technologies",
                "link": "https://www.coursera.org/learn/cryptocurrency",
                "description": "Understand how Bitcoin and cryptocurrencies work from Princeton University."
            }
        ]
    }
    
    # Skill to category mapping
    SKILL_CATEGORY_MAP = {
        # Frontend
        "react": "frontend", "vue": "frontend", "angular": "frontend", 
        "html": "frontend", "css": "frontend", "javascript": "frontend",
        "typescript": "frontend", "sass": "frontend", "webpack": "frontend",
        "bootstrap": "frontend", "tailwind": "frontend", "next.js": "frontend",
        
        # Backend
        "node.js": "backend", "express": "backend", "django": "backend",
        "flask": "backend", "spring": "backend", "java": "backend",
        "python": "backend", "ruby": "backend", "php": "backend",
        "laravel": "backend", ".net": "backend", "c#": "backend",
        "go": "backend", "rust": "backend",
        
        # Full Stack
        "full stack": "fullstack", "mern": "fullstack", "mean": "fullstack",
        
        # Mobile
        "react native": "mobile", "flutter": "mobile", "android": "mobile",
        "ios": "mobile", "swift": "mobile", "kotlin": "mobile",
        
        # Data Science & ML
        "machine learning": "datascience", "deep learning": "datascience",
        "tensorflow": "datascience", "pytorch": "datascience",
        "pandas": "datascience", "numpy": "datascience",
        "scikit-learn": "datascience", "data analysis": "datascience",
        "statistics": "datascience", "r": "datascience",
        
        # DevOps
        "docker": "devops", "kubernetes": "devops", "ci/cd": "devops",
        "jenkins": "devops", "terraform": "devops", "ansible": "devops",
        "aws": "devops", "azure": "devops", "gcp": "devops",
        "cloud": "devops", "devops": "devops",
        
        # Data Engineering
        "spark": "dataengineering", "hadoop": "dataengineering",
        "airflow": "dataengineering", "kafka": "dataengineering",
        "etl": "dataengineering", "data pipeline": "dataengineering",
        
        # Cybersecurity
        "security": "cybersecurity", "penetration testing": "cybersecurity",
        "ethical hacking": "cybersecurity", "network security": "cybersecurity",
        
        # AI
        "artificial intelligence": "ai", "nlp": "ai", "computer vision": "ai",
        "chatgpt": "ai", "llm": "ai", "generative ai": "ai",
        
        # QA
        "testing": "qa", "selenium": "qa", "automation testing": "qa",
        "qa": "qa", "quality assurance": "qa", "test automation": "qa",
        
        # UI/UX
        "ui": "uiux", "ux": "uiux", "figma": "uiux", "sketch": "uiux",
        "design": "uiux", "user experience": "uiux",
        
        # Product Management
        "product management": "productmanagement", "agile": "productmanagement",
        "scrum": "productmanagement",
        
        # Blockchain
        "blockchain": "blockchain", "ethereum": "blockchain", "solidity": "blockchain",
        "web3": "blockchain", "cryptocurrency": "blockchain"
    }
    
    @classmethod
    def get_category_from_skill(cls, skill: str) -> str:
        """Map a skill to a course category"""
        skill_lower = skill.lower().strip()
        return cls.SKILL_CATEGORY_MAP.get(skill_lower, None)
    
    @classmethod
    def get_category_from_career(cls, career_title: str) -> List[str]:
        """Map a career path to relevant course categories"""
        title_lower = career_title.lower()
        categories = []
        
        # Check for keywords in career title
        if any(word in title_lower for word in ["frontend", "front-end", "front end", "ui"]):
            categories.append("frontend")
        if any(word in title_lower for word in ["backend", "back-end", "back end", "api"]):
            categories.append("backend")
        if any(word in title_lower for word in ["full stack", "fullstack", "full-stack"]):
            categories.extend(["fullstack", "frontend", "backend"])
        if any(word in title_lower for word in ["mobile", "android", "ios", "react native"]):
            categories.append("mobile")
        if any(word in title_lower for word in ["data scientist", "machine learning", "ml engineer", "ai"]):
            categories.extend(["datascience", "ai"])
        if any(word in title_lower for word in ["devops", "cloud", "sre", "site reliability"]):
            categories.append("devops")
        if any(word in title_lower for word in ["data engineer", "big data"]):
            categories.append("dataengineering")
        if any(word in title_lower for word in ["security", "cybersecurity"]):
            categories.append("cybersecurity")
        if any(word in title_lower for word in ["qa", "test", "quality assurance"]):
            categories.append("qa")
        if any(word in title_lower for word in ["ux", "ui", "designer"]):
            categories.append("uiux")
        if any(word in title_lower for word in ["product manager", "product owner"]):
            categories.append("productmanagement")
        if any(word in title_lower for word in ["blockchain", "web3"]):
            categories.append("blockchain")
        
        # If no specific category found, default to fullstack for developers
        if not categories and "developer" in title_lower:
            categories.append("fullstack")
        
        # Remove duplicates
        return list(set(categories))
    
    @classmethod
    def recommend_courses_for_career(cls, career_title: str, num_courses: int = 3) -> List[Dict[str, str]]:
        """Recommend courses for a specific career path"""
        categories = cls.get_category_from_career(career_title)
        
        if not categories:
            # Default recommendations for general software development
            categories = ["fullstack"]
        
        courses = []
        for category in categories:
            if category in cls.COURSE_DATABASE:
                courses.extend(cls.COURSE_DATABASE[category])
        
        # Remove duplicates and limit to num_courses
        seen = set()
        unique_courses = []
        for course in courses:
            course_key = (course["platform"], course["name"])
            if course_key not in seen:
                seen.add(course_key)
                unique_courses.append(course)
                if len(unique_courses) >= num_courses:
                    break
        
        return unique_courses[:num_courses]
    
    @classmethod
    def recommend_courses_for_skills(cls, skills: List[str], num_courses: int = 3) -> List[Dict[str, str]]:
        """Recommend courses based on user skills"""
        categories = set()
        
        for skill in skills:
            category = cls.get_category_from_skill(skill)
            if category:
                categories.add(category)
        
        if not categories:
            # Default to fullstack if no categories found
            categories.add("fullstack")
        
        courses = []
        for category in categories:
            if category in cls.COURSE_DATABASE:
                courses.extend(cls.COURSE_DATABASE[category])
        
        # Remove duplicates and limit to num_courses
        seen = set()
        unique_courses = []
        for course in courses:
            course_key = (course["platform"], course["name"])
            if course_key not in seen:
                seen.add(course_key)
                unique_courses.append(course)
                if len(unique_courses) >= num_courses:
                    break
        
        return unique_courses[:num_courses]
    
    @classmethod
    def recommend_training(
        cls, 
        career_paths: List[Dict[str, Any]], 
        user_skills: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Recommend training based on predicted career paths
        
        Args:
            career_paths: List of predicted career paths
            user_skills: List of user skills
            
        Returns:
            List of training recommendations with courses
        """
        recommendations = []
        
        for i, career in enumerate(career_paths):
            # Get courses for this career path
            courses = cls.recommend_courses_for_career(career['title'], num_courses=3)
            
            recommendations.append({
                "id": i + 1,
                "title": career['title'],
                "courses": courses
            })
        
        return recommendations
