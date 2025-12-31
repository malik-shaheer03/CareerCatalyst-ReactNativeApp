"""
Utility functions for ML service
"""

def normalize_skills(skills):
    """
    Normalize skill names for better matching
    
    Args:
        skills (list): List of skill strings
        
    Returns:
        list: Normalized skill strings
    """
    normalized = []
    
    # Skill name mappings for common variations
    skill_mappings = {
        'javascript': 'JavaScript',
        'js': 'JavaScript',
        'reactjs': 'React',
        'react.js': 'React',
        'nodejs': 'Node.js',
        'node': 'Node.js',
        'typescript': 'TypeScript',
        'ts': 'TypeScript',
        'python3': 'Python',
        'py': 'Python',
        'java': 'Java',
        'csharp': 'C#',
        'c-sharp': 'C#',
        'cplusplus': 'C++',
        'c++': 'C++',
        'golang': 'Go',
        'aws': 'AWS',
        'amazon web services': 'AWS',
        'azure': 'Azure',
        'gcp': 'Google Cloud',
        'google cloud platform': 'Google Cloud',
        'ml': 'Machine Learning',
        'ai': 'Artificial Intelligence',
        'css3': 'CSS',
        'html5': 'HTML',
        'sql': 'SQL',
        'nosql': 'NoSQL',
        'mongodb': 'MongoDB',
        'postgresql': 'PostgreSQL',
        'mysql': 'MySQL',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'k8s': 'Kubernetes',
        'ci/cd': 'CI/CD',
        'devops': 'DevOps',
        'git': 'Git',
        'github': 'GitHub',
        'gitlab': 'GitLab',
    }
    
    for skill in skills:
        skill_lower = skill.lower().strip()
        normalized_skill = skill_mappings.get(skill_lower, skill.strip())
        normalized.append(normalized_skill)
    
    return normalized


def calculate_skill_coverage(user_skills, required_skills):
    """
    Calculate percentage of required skills that user has
    
    Args:
        user_skills (list): User's skills
        required_skills (list): Required skills for a career
        
    Returns:
        float: Coverage percentage (0-1)
    """
    if not required_skills:
        return 0.0
    
    user_skills_set = set([s.lower() for s in user_skills])
    required_skills_set = set([s.lower() for s in required_skills])
    
    matched_skills = user_skills_set.intersection(required_skills_set)
    coverage = len(matched_skills) / len(required_skills_set)
    
    return coverage


def get_missing_skills(user_skills, required_skills):
    """
    Get list of skills user is missing for a career path
    
    Args:
        user_skills (list): User's skills
        required_skills (list): Required skills for a career
        
    Returns:
        list: Missing skills
    """
    user_skills_set = set([s.lower() for s in user_skills])
    required_skills_dict = {s.lower(): s for s in required_skills}
    
    missing = []
    for skill_lower, skill_original in required_skills_dict.items():
        if skill_lower not in user_skills_set:
            missing.append(skill_original)
    
    return missing


def get_recommendations_text(career_path, user_skills, match_score):
    """
    Generate text recommendations for a career path
    
    Args:
        career_path (dict): Career path information
        user_skills (list): User's current skills
        match_score (float): Match score between user and career
        
    Returns:
        str: Recommendation text
    """
    if match_score > 0.7:
        return f"Excellent match! Your skills align very well with {career_path['title']}. You're well-prepared for this career path."
    elif match_score > 0.5:
        return f"Good match! You have a solid foundation for {career_path['title']}. Consider learning a few more relevant skills."
    elif match_score > 0.3:
        return f"Moderate match. {career_path['title']} could be a good option with additional skill development."
    else:
        return f"This path requires significant skill development, but it's achievable with dedication and learning."
