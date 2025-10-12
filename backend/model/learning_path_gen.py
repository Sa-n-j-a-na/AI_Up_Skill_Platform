def generate_learning_path(gap_analysis):
    # Basic roadmap suggestion
    roadmap = [{"skill": skill, "course": f"Learn {skill} on Coursera/YouTube"} for skill in gap_analysis["missingSkills"]]
    return roadmap
