# learning_path_gen.py

def generate_learning_path(gap_analysis):
    """
    Generates a high-quality learning roadmap based on missing skills.
    Uses ONLY trusted, globally recognized learning platforms.
    """

    # ===== TRUSTED COURSE CATALOG =====
    SKILL_RESOURCES = {

        # ---------- Programming ----------
        "Python": {
            "courses": [
                {
                    "title": "Python for Everybody – University of Michigan (Coursera)",
                    "url": "https://www.coursera.org/specializations/python"
                },
                {
                    "title": "Python Full Course – freeCodeCamp",
                    "url": "https://www.youtube.com/watch?v=rfscVS0vtbw"
                }
            ],
            "project": "Build a Python-based resume analyzer or automation script"
        },

        "Java": {
            "courses": [
                {
                    "title": "Java Programming – Duke University (Coursera)",
                    "url": "https://www.coursera.org/specializations/java-programming"
                }
            ],
            "project": "Build a backend REST API using Java"
        },

        "JavaScript": {
            "courses": [
                {
                    "title": "JavaScript – freeCodeCamp",
                    "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
                }
            ],
            "project": "Build a dynamic web application using JavaScript"
        },

        # ---------- AI / ML ----------
        "Machine Learning": {
            "courses": [
                {
                    "title": "Machine Learning – Andrew Ng (Stanford, Coursera)",
                    "url": "https://www.coursera.org/learn/machine-learning"
                }
            ],
            "project": "Build a machine learning model to predict outcomes from data"
        },

        "Deep Learning": {
            "courses": [
                {
                    "title": "Deep Learning Specialization – DeepLearning.AI",
                    "url": "https://www.coursera.org/specializations/deep-learning"
                }
            ],
            "project": "Build a neural network for image or text classification"
        },

        "TensorFlow": {
            "courses": [
                {
                    "title": "TensorFlow Developer Certificate – DeepLearning.AI",
                    "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice"
                }
            ],
            "project": "Build and deploy a TensorFlow deep learning model"
        },

        "PyTorch": {
            "courses": [
                {
                    "title": "Deep Learning with PyTorch – Facebook AI (Coursera)",
                    "url": "https://www.coursera.org/learn/deep-neural-networks-with-pytorch"
                }
            ],
            "project": "Implement a neural network using PyTorch"
        },

        # ---------- Data ----------
        "SQL": {
            "courses": [
                {
                    "title": "SQL for Data Science – UC Davis (Coursera)",
                    "url": "https://www.coursera.org/learn/sql-for-data-science"
                }
            ],
            "project": "Design and query a relational database"
        },

        # ---------- Cloud / DevOps ----------
        "AWS": {
            "courses": [
                {
                    "title": "AWS Cloud Practitioner Essentials – AWS",
                    "url": "https://www.aws.training"
                }
            ],
            "project": "Deploy an application on AWS EC2 or S3"
        },

        "Docker": {
            "courses": [
                {
                    "title": "Docker for Developers – freeCodeCamp",
                    "url": "https://www.youtube.com/watch?v=3c-iBn73dDE"
                }
            ],
            "project": "Dockerize a Flask or Node.js application"
        },
    }

    # ===== BUILD ROADMAP =====
    roadmap = []
    missing_skills = gap_analysis.get("missingSkills", [])

    for skill in missing_skills:
        # Use curated resource if available
        if skill in SKILL_RESOURCES:
            resource = SKILL_RESOURCES[skill]
        else:
            # Safe fallback (never crashes)
            resource = {
                "courses": [
                    {
                        "title": f"{skill} Courses on Coursera",
                        "url": f"https://www.coursera.org/search?query={skill}"
                    },
                    {
                        "title": f"{skill} Tutorials on freeCodeCamp",
                        "url": f"https://www.youtube.com/results?search_query={skill}+freecodecamp"
                    }
                ],
                "project": f"Build a small project demonstrating {skill}"
            }

        roadmap.append({
            "skill": skill,
            "recommended_courses": resource["courses"],
            "mini_project": resource["project"],
            "estimated_time": "1–2 weeks"
        })

    return roadmap
