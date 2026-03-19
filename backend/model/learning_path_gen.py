# learning_path_gen.py

import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)
_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ─────────────────────────────────────────────────────────
# GPT FALLBACK — only called for skills NOT in the dict
# Keeps API usage to an absolute minimum
# ─────────────────────────────────────────────────────────
def _gpt_fallback(skill: str) -> dict:
    prompt = f"""You are a career learning advisor. For the skill "{skill}", provide:
1. Two real, well-known online courses with their actual URLs.
2. One hands-on project idea that demonstrates this skill in a real-world scenario.

Respond ONLY with valid JSON. No markdown, no backticks, no explanation:
{{
  "courses": [
    {{"title": "Course title – Platform name", "url": "https://actual-url.com"}},
    {{"title": "Course title – Platform name", "url": "https://actual-url.com"}}
  ],
  "project": "A one-sentence hands-on project idea."
}}"""

    try:
        response = _client.responses.create(
            model="gpt-5-nano",
            input=[{"role": "user", "content": prompt}]
        )
        raw = response.output_text.strip()

        # Strip markdown fences if model wraps output in ```json ... ```
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data    = json.loads(raw)
        courses = data.get("courses", [])
        project = data.get("project", f"Build a real-world project applying {skill}.")

        if not isinstance(courses, list) or len(courses) < 1:
            raise ValueError("Invalid courses list from GPT")

        return {"courses": courses[:2], "project": project}

    except Exception as e:
        # Last-resort static fallback if GPT call itself fails
        print(f"[GPT fallback failed for '{skill}']: {e}")
        return {
            "courses": [
                {
                    "title": f"{skill} Course – Coursera",
                    "url": f"https://www.coursera.org/search?query={skill.replace(' ', '%20')}"
                },
                {
                    "title": f"{skill} Tutorial – freeCodeCamp",
                    "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+freecodecamp"
                }
            ],
            "project": f"Build a real-world project applying {skill} in a production scenario."
        }


def generate_learning_path(gap_analysis):
    """
    Generates a high-quality learning roadmap based on missing skills.
    Uses ONLY trusted, globally recognized learning platforms.
    Covers all skills across all 20 job roles in job_skills_data.json.
    GPT fallback ONLY for skills genuinely not in the dictionary (rare).
    """

    SKILL_RESOURCES = {

        # ================= PROGRAMMING =================
        "Python": {
            "courses": [
                {"title": "Python for Everybody – University of Michigan",
                 "url": "https://www.coursera.org/specializations/python"},
                {"title": "CS50 Python – Harvard",
                 "url": "https://cs50.harvard.edu/python/"}
            ],
            "project": "Build a production-ready Resume Analyzer with Flask + SQLite."
        },

        "Java": {
            "courses": [
                {"title": "Java Programming – Duke University",
                 "url": "https://www.coursera.org/specializations/java-programming"}
            ],
            "project": "Build a Spring Boot REST API with JWT authentication."
        },

        "C++": {
            "courses": [
                {"title": "C++ For Programmers – University of Colorado",
                 "url": "https://www.coursera.org/learn/c-plus-plus-a"}
            ],
            "project": "Build a CLI-based Data Structures library with memory management."
        },

        "C": {
            "courses": [
                {"title": "C Programming – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=KJgsSFOSQv0"}
            ],
            "project": "Develop a system-level file handling project in C."
        },

        "C#": {
            "courses": [
                {"title": "C# Programming – Microsoft Learn",
                 "url": "https://learn.microsoft.com/en-us/dotnet/csharp/"},
                {"title": "C# for Beginners – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=GhQdlIFylQ8"}
            ],
            "project": "Build a 2D Unity game using C# with player controls and scoring."
        },

        "R": {
            "courses": [
                {"title": "R Programming – Johns Hopkins",
                 "url": "https://www.coursera.org/learn/r-programming"}
            ],
            "project": "Perform statistical data analysis on real-world datasets."
        },

        "Swift": {
            "courses": [
                {"title": "iOS App Development with Swift – University of Toronto",
                 "url": "https://www.coursera.org/specializations/swift-5-ios-app-developer"},
                {"title": "Swift Official Documentation",
                 "url": "https://swift.org/documentation/"}
            ],
            "project": "Build a fully functional iOS to-do list app with local persistence."
        },

        "Dart": {
            "courses": [
                {"title": "Dart Programming – Official Docs",
                 "url": "https://dart.dev/guides"},
                {"title": "Dart & Flutter – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=1ukSR1GRtMU"}
            ],
            "project": "Build a cross-platform expense tracker using Flutter and Dart."
        },

        "Objective-C": {
            "courses": [
                {"title": "Objective-C Programming – Apple Developer",
                 "url": "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html"}
            ],
            "project": "Build a basic iOS utility app using Objective-C."
        },

        # ================= CORE CS =================
        "Data Structures": {
            "courses": [
                {"title": "Data Structures & Algorithms – UC San Diego",
                 "url": "https://www.coursera.org/specializations/data-structures-algorithms"}
            ],
            "project": "Implement advanced data structures and solve 100+ LeetCode problems."
        },

        "Algorithms": {
            "courses": [
                {"title": "Algorithms Specialization – Stanford",
                 "url": "https://www.coursera.org/specializations/algorithms"}
            ],
            "project": "Build a graph algorithm visualizer (BFS, DFS, Dijkstra)."
        },

        "OOP": {
            "courses": [
                {"title": "Object-Oriented Programming – Coursera",
                 "url": "https://www.coursera.org/learn/object-oriented-java"}
            ],
            "project": "Design a full Library Management System using OOP."
        },

        "Git": {
            "courses": [
                {"title": "Git & GitHub – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/news/git-and-github-for-beginners/"}
            ],
            "project": "Manage a collaborative multi-branch project using Git workflow."
        },

        "Linux": {
            "courses": [
                {"title": "Linux Fundamentals – Linux Foundation",
                 "url": "https://training.linuxfoundation.org/"}
            ],
            "project": "Set up a Linux server and automate system tasks with Bash."
        },

        "Agile": {
            "courses": [
                {"title": "Agile Development – University of Virginia",
                 "url": "https://www.coursera.org/specializations/agile-development"},
                {"title": "Agile with Atlassian Jira",
                 "url": "https://www.coursera.org/learn/agile-atlassian-jira"}
            ],
            "project": "Manage a software project sprint using Jira with user stories, backlogs, and sprint reviews."
        },

        "Debugging": {
            "courses": [
                {"title": "Software Debugging – Udacity",
                 "url": "https://www.udacity.com/course/software-debugging--cs259"},
                {"title": "Debugging in VS Code – Official Docs",
                 "url": "https://code.visualstudio.com/docs/editor/debugging"}
            ],
            "project": "Debug a buggy Python/C++ project using breakpoints, logging, and memory analysis tools."
        },

        # ================= FRONTEND =================
        "HTML": {
            "courses": [
                {"title": "Responsive Web Design – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/"}
            ],
            "project": "Build a fully responsive professional portfolio website."
        },

        "CSS": {
            "courses": [
                {"title": "CSS Flexbox & Grid – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/news/learn-css/"}
            ],
            "project": "Design a modern SaaS dashboard UI."
        },

        "JavaScript": {
            "courses": [
                {"title": "JavaScript Algorithms – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"}
            ],
            "project": "Build a full-featured task manager with API integration."
        },

        "React": {
            "courses": [
                {"title": "Meta React Developer Certificate",
                 "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer"}
            ],
            "project": "Build a complete dashboard with authentication and protected routes."
        },

        "Vue.js": {
            "courses": [
                {"title": "Vue.js Official Guide",
                 "url": "https://vuejs.org/guide/introduction.html"}
            ],
            "project": "Build a Single Page Application using Vue Router."
        },

        "Angular": {
            "courses": [
                {"title": "Angular – Official Docs",
                 "url": "https://angular.io/start"}
            ],
            "project": "Develop an Admin Panel with Angular and REST APIs."
        },

        "TypeScript": {
            "courses": [
                {"title": "Understanding TypeScript – Udemy",
                 "url": "https://www.udemy.com/course/understanding-typescript/"}
            ],
            "project": "Refactor a React app into TypeScript."
        },

        "Webpack": {
            "courses": [
                {"title": "Webpack – Official Documentation",
                 "url": "https://webpack.js.org/guides/getting-started/"},
                {"title": "Webpack 5 Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=MpGLUVbqoYQ"}
            ],
            "project": "Configure a custom Webpack build pipeline for a React app with code splitting and lazy loading."
        },

        "Responsive Design": {
            "courses": [
                {"title": "Responsive Web Design – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/"},
                {"title": "CSS for Developers – web.dev",
                 "url": "https://web.dev/learn/css/"}
            ],
            "project": "Build a fully responsive multi-page website that works across mobile, tablet, and desktop."
        },

        "UI/UX": {
            "courses": [
                {"title": "Google UX Design Professional Certificate",
                 "url": "https://www.coursera.org/professional-certificates/google-ux-design"},
                {"title": "UI/UX Design Specialization – CalArts",
                 "url": "https://www.coursera.org/specializations/ui-ux-design"}
            ],
            "project": "Design a complete UI/UX prototype for a mobile app — from wireframes to high-fidelity Figma mockups."
        },

        "Design Systems": {
            "courses": [
                {"title": "Design Systems with Figma – Google UX Certificate",
                 "url": "https://www.coursera.org/professional-certificates/google-ux-design"},
                {"title": "Building Design Systems – Figma Official",
                 "url": "https://www.figma.com/resources/learn-design/design-systems/"}
            ],
            "project": "Build a reusable component library and design system for a SaaS product in Figma."
        },

        # ================= BACKEND =================
        "Node.js": {
            "courses": [
                {"title": "Node & Express – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"}
            ],
            "project": "Build a secure REST API with JWT + MongoDB."
        },

        "Node JS": {
            "courses": [
                {"title": "Node.js Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"},
                {"title": "The Complete Node.js Developer Course – Udemy",
                 "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/"}
            ],
            "project": "Build a RESTful API server with Node JS, Express, and MongoDB with full CRUD operations."
        },

        "Express JS": {
            "courses": [
                {"title": "Express.js – Official Documentation",
                 "url": "https://expressjs.com/en/starter/installing.html"},
                {"title": "Node.js & Express – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"}
            ],
            "project": "Build a fully featured REST API with Express JS including middleware, authentication, and error handling."
        },

        "Express.js": {
            "courses": [
                {"title": "Express.js – Official Documentation",
                 "url": "https://expressjs.com/en/starter/installing.html"},
                {"title": "Node.js & Express Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"}
            ],
            "project": "Create a production-ready Express.js backend with JWT auth, rate limiting, and MongoDB integration."
        },

        "Spring Boot": {
            "courses": [
                {"title": "Spring Boot Guides",
                 "url": "https://spring.io/guides"}
            ],
            "project": "Develop a microservice-based e-commerce backend."
        },

        "Django": {
            "courses": [
                {"title": "Django for Everybody",
                 "url": "https://www.coursera.org/specializations/django"}
            ],
            "project": "Build a full blog platform with authentication."
        },

        "Flask": {
            "courses": [
                {"title": "Flask Crash Course",
                 "url": "https://www.youtube.com/watch?v=Z1RJmh_OqeA"}
            ],
            "project": "Create a REST API with Flask and connect it to frontend."
        },

        "REST APIs": {
            "courses": [
                {"title": "APIs and Microservices – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/"},
                {"title": "REST API Design – Udemy",
                 "url": "https://www.udemy.com/course/rest-api-flask-and-python/"}
            ],
            "project": "Design and build a fully documented RESTful API with authentication, versioning, and Swagger docs."
        },

        "Microservices": {
            "courses": [
                {"title": "Microservices with Node.js & React – Udemy",
                 "url": "https://www.udemy.com/course/microservices-with-node-js-and-react/"},
                {"title": "Microservices Specialization – Duke University",
                 "url": "https://www.coursera.org/specializations/building-microservices-with-spring-boot"}
            ],
            "project": "Build a microservices-based e-commerce system with independent services for auth, products, and orders."
        },

        "NoSQL": {
            "courses": [
                {"title": "MongoDB University – Free Courses",
                 "url": "https://university.mongodb.com/"},
                {"title": "NoSQL Databases – IBM",
                 "url": "https://www.coursera.org/learn/introduction-to-nosql-databases"}
            ],
            "project": "Build a NoSQL-powered social media backend using MongoDB with indexing and aggregation pipelines."
        },

        # ================= DATA & AI =================
        "Machine Learning": {
            "courses": [
                {"title": "Machine Learning – Andrew Ng",
                 "url": "https://www.coursera.org/learn/machine-learning"}
            ],
            "project": "Build a salary prediction ML model and deploy it."
        },

        "Deep Learning": {
            "courses": [
                {"title": "Deep Learning Specialization – DeepLearning.AI",
                 "url": "https://www.coursera.org/specializations/deep-learning"}
            ],
            "project": "Build an image classifier using CNN."
        },

        "TensorFlow": {
            "courses": [
                {"title": "TensorFlow Developer Certificate",
                 "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice"}
            ],
            "project": "Train and deploy a neural network model."
        },

        "PyTorch": {
            "courses": [
                {"title": "Deep Learning with PyTorch – Meta",
                 "url": "https://www.coursera.org/learn/deep-neural-networks-with-pytorch"}
            ],
            "project": "Build an NLP sentiment analysis model."
        },

        "Pandas": {
            "courses": [
                {"title": "Data Analysis with Python – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/"}
            ],
            "project": "Perform EDA on job dataset and visualize insights."
        },

        "Numpy": {
            "courses": [
                {"title": "NumPy Official Documentation",
                 "url": "https://numpy.org/doc/"}
            ],
            "project": "Build matrix computation utilities."
        },

        "Scikit-learn": {
            "courses": [
                {"title": "Scikit-learn Official Documentation & Tutorials",
                 "url": "https://scikit-learn.org/stable/tutorial/index.html"},
                {"title": "Machine Learning with Python – IBM",
                 "url": "https://www.coursera.org/learn/machine-learning-with-python"}
            ],
            "project": "Build a customer churn prediction model using Scikit-learn with cross-validation and hyperparameter tuning."
        },

        "Statistics": {
            "courses": [
                {"title": "Statistics with Python – University of Michigan",
                 "url": "https://www.coursera.org/specializations/statistics-with-python"},
                {"title": "Intro to Statistics – Khan Academy",
                 "url": "https://www.khanacademy.org/math/statistics-probability"}
            ],
            "project": "Perform a full statistical analysis on a real-world dataset — hypothesis testing, regression, and visualization."
        },

        "Data Visualization": {
            "courses": [
                {"title": "Data Visualization with Python – IBM",
                 "url": "https://www.coursera.org/learn/python-for-data-visualization"},
                {"title": "Data Visualization – freeCodeCamp",
                 "url": "https://www.freecodecamp.org/learn/data-visualization/"}
            ],
            "project": "Build an interactive data dashboard using Matplotlib, Seaborn, and Plotly on a real dataset."
        },

        "ML Algorithms": {
            "courses": [
                {"title": "Machine Learning Specialization – Andrew Ng",
                 "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
                {"title": "ML Algorithms Explained – StatQuest",
                 "url": "https://www.youtube.com/c/joshstarmer"}
            ],
            "project": "Implement 5 classic ML algorithms (linear regression, SVM, decision tree, KNN, k-means) from scratch."
        },

        "Data Preprocessing": {
            "courses": [
                {"title": "Feature Engineering – Kaggle Learn",
                 "url": "https://www.kaggle.com/learn/feature-engineering"},
                {"title": "Data Preprocessing – Towards Data Science",
                 "url": "https://www.coursera.org/learn/data-preparation-and-feature-engineering-ml"}
            ],
            "project": "Preprocess a messy real-world dataset — handle missing values, outliers, encoding, and scaling."
        },

        "Feature Engineering": {
            "courses": [
                {"title": "Feature Engineering – Kaggle Learn",
                 "url": "https://www.kaggle.com/learn/feature-engineering"},
                {"title": "Advanced Feature Engineering – Coursera",
                 "url": "https://www.coursera.org/learn/feature-engineering"}
            ],
            "project": "Engineer features from raw data to improve an ML model's accuracy by at least 10%."
        },

        "Model Deployment": {
            "courses": [
                {"title": "MLOps Specialization – DeepLearning.AI",
                 "url": "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"},
                {"title": "Deploy ML Models with Flask & Docker – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=ipFUANeStYE"}
            ],
            "project": "Deploy a trained ML model as a REST API using Flask and Docker, hosted on AWS EC2."
        },

        "NLP": {
            "courses": [
                {"title": "Natural Language Processing Specialization – DeepLearning.AI",
                 "url": "https://www.coursera.org/specializations/natural-language-processing"},
                {"title": "NLP with Python – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=X2vAabgKiuM"}
            ],
            "project": "Build a text classification system to detect sentiment from customer reviews using BERT."
        },

        "Computer Vision": {
            "courses": [
                {"title": "Deep Learning & Computer Vision – Stanford CS231n",
                 "url": "https://cs231n.stanford.edu/"},
                {"title": "Computer Vision – Coursera",
                 "url": "https://www.coursera.org/learn/computer-vision-basics"}
            ],
            "project": "Build a real-time object detection system using YOLO and OpenCV."
        },

        # ================= DATABASE =================
        "SQL": {
            "courses": [
                {"title": "SQL for Data Science – UC Davis",
                 "url": "https://www.coursera.org/learn/sql-for-data-science"}
            ],
            "project": "Design a job portal relational database."
        },

        "MongoDB": {
            "courses": [
                {"title": "MongoDB University",
                 "url": "https://university.mongodb.com/"}
            ],
            "project": "Build a NoSQL backend using MongoDB Atlas."
        },

        "MySQL": {
            "courses": [
                {"title": "MySQL for Developers – PlanetScale",
                 "url": "https://planetscale.com/courses/mysql-for-developers"},
                {"title": "MySQL Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"}
            ],
            "project": "Design and optimize a relational database for an e-commerce platform in MySQL."
        },

        "PostgreSQL": {
            "courses": [
                {"title": "Learn PostgreSQL – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=qw--VYLpxG4"},
                {"title": "PostgreSQL Official Tutorial",
                 "url": "https://www.postgresql.org/docs/current/tutorial.html"}
            ],
            "project": "Build a scalable PostgreSQL database with indexing, stored procedures, and query optimization."
        },

        "Oracle": {
            "courses": [
                {"title": "Oracle Database SQL – Oracle University",
                 "url": "https://education.oracle.com/oracle-database-sql/pexam_1Z0-071"},
                {"title": "Oracle SQL – Udemy",
                 "url": "https://www.udemy.com/course/oracle-sql-12c-become-an-sql-developer-with-subtitle/"}
            ],
            "project": "Design an Oracle database schema for a banking system with stored procedures and triggers."
        },

        "Backup & Recovery": {
            "courses": [
                {"title": "Database Administration – Oracle University",
                 "url": "https://education.oracle.com/"},
                {"title": "Backup & Recovery Strategies – LinkedIn Learning",
                 "url": "https://www.linkedin.com/learning/topics/backup-and-recovery"}
            ],
            "project": "Set up automated backup and point-in-time recovery for a PostgreSQL or MySQL production database."
        },

        "Performance Tuning": {
            "courses": [
                {"title": "SQL Performance Tuning – Udemy",
                 "url": "https://www.udemy.com/course/sql-performance-tuning-masterclass/"},
                {"title": "Database Performance Tuning – LinkedIn Learning",
                 "url": "https://www.linkedin.com/learning/topics/database-performance"}
            ],
            "project": "Identify and fix slow queries in a MySQL database using EXPLAIN plans and indexing strategies."
        },

        "Replication": {
            "courses": [
                {"title": "MySQL Replication – Official Docs",
                 "url": "https://dev.mysql.com/doc/refman/8.0/en/replication.html"},
                {"title": "PostgreSQL Replication – Official Docs",
                 "url": "https://www.postgresql.org/docs/current/high-availability.html"}
            ],
            "project": "Configure master-slave replication in MySQL for a high-availability database setup."
        },

        "Cloud Databases": {
            "courses": [
                {"title": "AWS RDS & Aurora – AWS Training",
                 "url": "https://aws.amazon.com/training/"},
                {"title": "Cloud Databases – Google Cloud Skills Boost",
                 "url": "https://www.cloudskillsboost.google/"}
            ],
            "project": "Deploy and manage a cloud database on AWS RDS with automated backups and read replicas."
        },

        "BigQuery": {
            "courses": [
                {"title": "BigQuery for Data Analysts – Google Cloud",
                 "url": "https://www.cloudskillsboost.google/course_templates/83"},
                {"title": "From Data to Insights with BigQuery – Coursera",
                 "url": "https://www.coursera.org/specializations/from-data-to-insights-google-cloud"}
            ],
            "project": "Analyze a large public dataset using BigQuery SQL and build a visualization dashboard in Looker Studio."
        },

        "Snowflake": {
            "courses": [
                {"title": "Snowflake Hands-On Essentials – Snowflake",
                 "url": "https://learn.snowflake.com/"},
                {"title": "Snowflake for Beginners – Udemy",
                 "url": "https://www.udemy.com/course/snowflake-masterclass/"}
            ],
            "project": "Build a data warehouse in Snowflake with staging, transformation layers, and role-based access control."
        },

        "Data Warehousing": {
            "courses": [
                {"title": "Data Warehousing for Business Intelligence – UC Colorado",
                 "url": "https://www.coursera.org/specializations/data-warehousing"},
                {"title": "Modern Data Warehousing – Coursera",
                 "url": "https://www.coursera.org/learn/dwdesign"}
            ],
            "project": "Design a star-schema data warehouse for a retail business and populate it with an ETL pipeline."
        },

        # ================= DEVOPS & CLOUD =================
        "AWS": {
            "courses": [
                {"title": "AWS Cloud Practitioner Essentials",
                 "url": "https://www.aws.training"}
            ],
            "project": "Deploy a full-stack application on AWS EC2."
        },

        "Docker": {
            "courses": [
                {"title": "Docker for Developers – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=3c-iBn73dDE"}
            ],
            "project": "Containerize and deploy a full-stack app."
        },

        "Kubernetes": {
            "courses": [
                {"title": "Kubernetes for Beginners",
                 "url": "https://www.youtube.com/watch?v=X48VuDVv0do"}
            ],
            "project": "Deploy scalable microservices using Kubernetes."
        },

        "CI/CD": {
            "courses": [
                {"title": "CI/CD Pipelines – Google Cloud",
                 "url": "https://www.coursera.org/learn/google-cloud-fundamentals-core-infrastructure"},
                {"title": "DevOps CI/CD with GitHub Actions – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=R8_veQiYBjI"}
            ],
            "project": "Set up a full CI/CD pipeline using GitHub Actions that runs tests, builds a Docker image, and deploys to AWS."
        },

        "Jenkins": {
            "courses": [
                {"title": "Jenkins – Official Documentation",
                 "url": "https://www.jenkins.io/doc/"},
                {"title": "Jenkins Full Course – Edureka",
                 "url": "https://www.youtube.com/watch?v=FX322RVNGj4"}
            ],
            "project": "Configure a Jenkins CI/CD pipeline that auto-builds, tests, and deploys a Java Spring Boot app."
        },

        "Terraform": {
            "courses": [
                {"title": "HashiCorp Terraform Associate – Official",
                 "url": "https://developer.hashicorp.com/terraform/tutorials"},
                {"title": "Terraform on AWS – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=SLB_c_ayRMo"}
            ],
            "project": "Use Terraform to provision a full AWS infrastructure including VPC, EC2, RDS, and S3 from code."
        },

        "Ansible": {
            "courses": [
                {"title": "Ansible for Beginners – KodeKloud",
                 "url": "https://kodekloud.com/courses/ansible-for-the-absolute-beginners/"},
                {"title": "Ansible Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=goclfp6a2IQ"}
            ],
            "project": "Automate server configuration and application deployment across multiple servers using Ansible playbooks."
        },

        "Shell Scripting": {
            "courses": [
                {"title": "Shell Scripting – Linux Foundation",
                 "url": "https://training.linuxfoundation.org/training/a-beginners-guide-to-linux-kernel-development-lfd103/"},
                {"title": "Bash Shell Scripting – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=e7BufAVwDiM"}
            ],
            "project": "Write a shell script that automates server setup, log rotation, and backup scheduling on Linux."
        },

        "Monitoring Tools": {
            "courses": [
                {"title": "Prometheus & Grafana – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=h4Sl21AKiDg"},
                {"title": "Site Reliability Engineering – Google",
                 "url": "https://sre.google/sre-book/table-of-contents/"}
            ],
            "project": "Set up a full monitoring stack with Prometheus and Grafana to track server and application metrics."
        },

        "Monitoring": {
            "courses": [
                {"title": "IT Infrastructure Monitoring – Coursera",
                 "url": "https://www.coursera.org/learn/it-infrastructure-and-emerging-trends"},
                {"title": "Prometheus & Grafana Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=h4Sl21AKiDg"}
            ],
            "project": "Monitor a multi-service application using Prometheus metrics and visualize alerts in Grafana."
        },

        "Cloud Platforms": {
            "courses": [
                {"title": "Cloud Computing Specialization – University of Illinois",
                 "url": "https://www.coursera.org/specializations/cloud-computing"},
                {"title": "AWS + GCP + Azure Overview – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=M988_fsOSWo"}
            ],
            "project": "Deploy the same containerized app on AWS, GCP, and Azure and compare cost, performance, and setup."
        },

        # ================= MOBILE =================
        "Kotlin": {
            "courses": [
                {"title": "Android Development with Kotlin",
                 "url": "https://www.coursera.org/specializations/android-kotlin"}
            ],
            "project": "Build a production-ready Android app."
        },

        "Flutter": {
            "courses": [
                {"title": "Flutter & Dart – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=1ukSR1GRtMU"}
            ],
            "project": "Develop a cross-platform mobile application."
        },

        "React Native": {
            "courses": [
                {"title": "React Native – Official Docs",
                 "url": "https://reactnative.dev/docs/getting-started"},
                {"title": "React Native Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=obH0Po_RdWk"}
            ],
            "project": "Build a cross-platform food delivery app with real-time tracking using React Native and Firebase."
        },

        "Xcode": {
            "courses": [
                {"title": "iOS Development with Xcode – Apple Developer",
                 "url": "https://developer.apple.com/tutorials/swiftui"},
                {"title": "SwiftUI & Xcode – Stanford CS193p",
                 "url": "https://cs193p.sites.stanford.edu/"}
            ],
            "project": "Build and publish an iOS app to TestFlight using Xcode with SwiftUI and local data persistence."
        },

        "Android Studio": {
            "courses": [
                {"title": "Android Basics with Compose – Google",
                 "url": "https://developer.android.com/courses/android-basics-compose/course"},
                {"title": "Android Development – Udacity",
                 "url": "https://www.udacity.com/course/developing-android-apps-with-kotlin--ud9012"}
            ],
            "project": "Build a full-featured Android app with Kotlin, Room database, and REST API integration using Android Studio."
        },

        "Firebase": {
            "courses": [
                {"title": "Firebase – Official Documentation",
                 "url": "https://firebase.google.com/docs"},
                {"title": "Firebase Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=9zdvmgGsww0"}
            ],
            "project": "Build a real-time chat app using Firebase Firestore, Authentication, and Cloud Functions."
        },

        # ================= BLOCKCHAIN =================
        "Solidity": {
            "courses": [
                {"title": "Ethereum & Solidity Developer Course",
                 "url": "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/"}
            ],
            "project": "Develop and deploy a smart contract on Ethereum testnet."
        },

        "Ethereum": {
            "courses": [
                {"title": "Ethereum & Blockchain – Coursera",
                 "url": "https://www.coursera.org/learn/blockchain-basics"},
                {"title": "Ethereum Developer Bootcamp – Alchemy University",
                 "url": "https://university.alchemy.com/"}
            ],
            "project": "Deploy an ERC-20 token smart contract on the Ethereum testnet and interact with it via Web3.js."
        },

        "Smart Contracts": {
            "courses": [
                {"title": "Smart Contract Development – Alchemy University",
                 "url": "https://university.alchemy.com/"},
                {"title": "Solidity & Smart Contracts – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=M576WGiDBdQ"}
            ],
            "project": "Write, test, and deploy a smart contract for a decentralized voting system using Solidity and Hardhat."
        },

        "Web3.js": {
            "courses": [
                {"title": "Web3.js Official Documentation",
                 "url": "https://web3js.readthedocs.io/en/v1.10.0/"},
                {"title": "Web3 Development – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=gyMwXuJrbJQ"}
            ],
            "project": "Build a decentralized application (DApp) frontend that connects to a smart contract using Web3.js."
        },

        "Truffle": {
            "courses": [
                {"title": "Truffle Suite – Official Documentation",
                 "url": "https://trufflesuite.com/docs/"},
                {"title": "Truffle & Smart Contracts – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=ZaqAwOzEiQ8"}
            ],
            "project": "Use Truffle to develop, test, and deploy a smart contract suite with automated test scripts."
        },

        "Hyperledger": {
            "courses": [
                {"title": "Blockchain for Business – Linux Foundation",
                 "url": "https://training.linuxfoundation.org/training/blockchain-for-business-an-introduction-to-hyperledger-technologies/"},
                {"title": "Hyperledger Fabric – Coursera",
                 "url": "https://www.coursera.org/learn/hyperledger"}
            ],
            "project": "Set up a Hyperledger Fabric network and deploy a supply chain chaincode application."
        },

        # ================= CYBERSECURITY =================
        "Network Security": {
            "courses": [
                {"title": "IBM Cybersecurity Analyst",
                 "url": "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst"}
            ],
            "project": "Implement secure network architecture in lab."
        },

        "Penetration Testing": {
            "courses": [
                {"title": "Penetration Testing & Ethical Hacking",
                 "url": "https://www.coursera.org/learn/penetration-testing"}
            ],
            "project": "Conduct ethical hacking simulation."
        },

        "Cryptography": {
            "courses": [
                {"title": "Cryptography I – Stanford",
                 "url": "https://www.coursera.org/learn/crypto"}
            ],
            "project": "Implement encryption & hashing algorithms."
        },

        "Firewalls": {
            "courses": [
                {"title": "Network Security & Firewalls – Coursera",
                 "url": "https://www.coursera.org/learn/network-security-database-vulnerabilities"},
                {"title": "Firewalls & Network Defense – Cybrary",
                 "url": "https://www.cybrary.it/course/firewalls/"}
            ],
            "project": "Configure and test firewall rules on a virtual network to block/allow specific traffic patterns."
        },

        "IDS/IPS": {
            "courses": [
                {"title": "Intrusion Detection – Cybrary",
                 "url": "https://www.cybrary.it/course/intrusion-detection-systems/"},
                {"title": "Network Defense Essentials – EC-Council",
                 "url": "https://www.coursera.org/learn/network-security-database-vulnerabilities"}
            ],
            "project": "Set up Snort IDS on a virtual network and write custom rules to detect common attack patterns."
        },

        "SIEM": {
            "courses": [
                {"title": "Security Operations & SIEM – Coursera",
                 "url": "https://www.coursera.org/learn/security-operations-and-siem-tools"},
                {"title": "Splunk Fundamentals – Splunk Training",
                 "url": "https://www.splunk.com/en_us/training.html"}
            ],
            "project": "Set up a Splunk SIEM instance, ingest log data, and create dashboards to detect anomalous activity."
        },

        "Incident Response": {
            "courses": [
                {"title": "Incident Response – IBM Cybersecurity Analyst",
                 "url": "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst"},
                {"title": "Cyber Incident Response – Coursera",
                 "url": "https://www.coursera.org/learn/cyber-incident-response"}
            ],
            "project": "Simulate a cyber incident response exercise — detect, contain, eradicate, and document a mock breach."
        },

        "Cloud Security": {
            "courses": [
                {"title": "Security in Google Cloud – Coursera",
                 "url": "https://www.coursera.org/specializations/security-google-cloud-platform"},
                {"title": "AWS Security Fundamentals – AWS Training",
                 "url": "https://aws.amazon.com/training/"}
            ],
            "project": "Audit and harden an AWS cloud environment using IAM policies, security groups, and CloudTrail."
        },

        "Vulnerability Management": {
            "courses": [
                {"title": "Vulnerability Management – Qualys",
                 "url": "https://www.qualys.com/training/"},
                {"title": "Ethical Hacking – EC-Council CEH",
                 "url": "https://www.coursera.org/learn/ethical-hacking-fundamentals"}
            ],
            "project": "Run a vulnerability scan using Nessus on a test environment and produce a remediation report."
        },

        "Security": {
            "courses": [
                {"title": "IT Security: Defense Against the Digital Dark Arts – Google",
                 "url": "https://www.coursera.org/learn/it-security"},
                {"title": "Cybersecurity Fundamentals – IBM",
                 "url": "https://www.coursera.org/learn/intro-cyber-security"}
            ],
            "project": "Perform a security audit on a web application — identify vulnerabilities and write a remediation report."
        },

        # ================= NETWORKING =================
        "Networking": {
            "courses": [
                {"title": "Cisco Networking Basics",
                 "url": "https://www.coursera.org/specializations/networking-basics"}
            ],
            "project": "Design and simulate enterprise network architecture."
        },

        "Routing": {
            "courses": [
                {"title": "Computer Networking – Georgia Tech",
                 "url": "https://www.coursera.org/learn/computer-networking"}
            ],
            "project": "Simulate routing protocols using Packet Tracer."
        },

        "Switching": {
            "courses": [
                {"title": "Cisco Switching Concepts",
                 "url": "https://www.netacad.com/"}
            ],
            "project": "Configure VLAN network simulation."
        },

        "Cisco": {
            "courses": [
                {"title": "Cisco Networking Academy – CCNA",
                 "url": "https://www.netacad.com/courses/networking"},
                {"title": "CCNA 200-301 – Udemy",
                 "url": "https://www.udemy.com/course/ccna-complete/"}
            ],
            "project": "Configure a Cisco router and switch topology with VLANs, inter-VLAN routing, and OSPF in Packet Tracer."
        },

        "VPN": {
            "courses": [
                {"title": "VPN & Network Security – Coursera",
                 "url": "https://www.coursera.org/learn/network-security-database-vulnerabilities"},
                {"title": "OpenVPN Setup Guide – Official Docs",
                 "url": "https://openvpn.net/community-resources/how-to/"}
            ],
            "project": "Set up and configure an OpenVPN server and connect multiple clients securely."
        },

        "LAN/WAN": {
            "courses": [
                {"title": "LAN/WAN Fundamentals – Cisco NetAcad",
                 "url": "https://www.netacad.com/"},
                {"title": "Enterprise Networking – Coursera",
                 "url": "https://www.coursera.org/specializations/networking-basics"}
            ],
            "project": "Design and simulate a multi-site LAN/WAN topology with routing and redundancy in Packet Tracer."
        },

        "VoIP": {
            "courses": [
                {"title": "VoIP Fundamentals – Cisco NetAcad",
                 "url": "https://www.netacad.com/"},
                {"title": "Introduction to VoIP – Udemy",
                 "url": "https://www.udemy.com/course/voip-for-beginners/"}
            ],
            "project": "Configure a VoIP solution using Asterisk PBX and connect softphone clients over a simulated network."
        },

        "Network Monitoring": {
            "courses": [
                {"title": "Network Monitoring with Nagios – Udemy",
                 "url": "https://www.udemy.com/course/nagios-monitoring/"},
                {"title": "Wireshark for Network Analysis – Udemy",
                 "url": "https://www.udemy.com/course/wireshark-course/"}
            ],
            "project": "Set up Nagios to monitor a multi-server environment and configure alerts for downtime and high load."
        },

        "Cloud Networking": {
            "courses": [
                {"title": "Networking in Google Cloud – Coursera",
                 "url": "https://www.coursera.org/specializations/networking-google-cloud"},
                {"title": "AWS Networking Fundamentals – AWS Training",
                 "url": "https://aws.amazon.com/training/"}
            ],
            "project": "Design a cloud networking architecture on AWS with VPCs, subnets, load balancers, and VPN gateways."
        },

        # ================= SYSTEM ADMINISTRATION =================
        "Windows Server": {
            "courses": [
                {"title": "Windows Server Administration – Microsoft Learn",
                 "url": "https://learn.microsoft.com/en-us/training/paths/windows-server-essentials/"},
                {"title": "Windows Server 2022 – Udemy",
                 "url": "https://www.udemy.com/course/windows-server-2022/"}
            ],
            "project": "Set up a Windows Server environment with Active Directory, Group Policy, and IIS web hosting."
        },

        "Active Directory": {
            "courses": [
                {"title": "Active Directory – Microsoft Learn",
                 "url": "https://learn.microsoft.com/en-us/training/paths/active-directory-domain-services/"},
                {"title": "Active Directory Full Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=85-bp7XxWDQ"}
            ],
            "project": "Configure an Active Directory domain with users, groups, OUs, and Group Policy Objects in a lab environment."
        },

        "DNS": {
            "courses": [
                {"title": "DNS Fundamentals – Cisco NetAcad",
                 "url": "https://www.netacad.com/"},
                {"title": "DNS & DHCP – Microsoft Learn",
                 "url": "https://learn.microsoft.com/en-us/training/paths/windows-server-essentials/"}
            ],
            "project": "Set up a BIND DNS server on Linux and configure forward/reverse lookup zones for a local domain."
        },

        "DHCP": {
            "courses": [
                {"title": "DHCP Configuration – Microsoft Learn",
                 "url": "https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top"},
                {"title": "Networking Services – Cisco NetAcad",
                 "url": "https://www.netacad.com/"}
            ],
            "project": "Configure a DHCP server with scopes, reservations, and failover in a Windows Server lab environment."
        },

        "Virtualization": {
            "courses": [
                {"title": "Virtualization – VMware Learning",
                 "url": "https://www.vmware.com/learning.html"},
                {"title": "VirtualBox & VMware – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=wX75Z-4MEoM"}
            ],
            "project": "Set up a virtualized lab environment using VMware or VirtualBox with multiple interconnected VMs."
        },

        "Backup Solutions": {
            "courses": [
                {"title": "Backup & Disaster Recovery – LinkedIn Learning",
                 "url": "https://www.linkedin.com/learning/topics/backup-and-recovery"},
                {"title": "Veeam Backup Essentials – Veeam University",
                 "url": "https://www.veeam.com/free-it-training.html"}
            ],
            "project": "Implement an automated backup solution for servers using Veeam or rsync with offsite replication."
        },

        # ================= QA =================
        "Manual Testing": {
            "courses": [
                {"title": "Software Testing and Automation",
                 "url": "https://www.coursera.org/specializations/software-testing-automation"}
            ],
            "project": "Create detailed test cases for a web app."
        },

        "Selenium": {
            "courses": [
                {"title": "Selenium WebDriver with Python",
                 "url": "https://www.udemy.com/course/selenium-webdriver-with-python3/"}
            ],
            "project": "Automate UI testing for login and dashboard."
        },

        "Automation Testing": {
            "courses": [
                {"title": "Test Automation – Coursera",
                 "url": "https://www.coursera.org/specializations/software-testing-automation"},
                {"title": "Selenium + Python Automation – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=j7VZsCCnptM"}
            ],
            "project": "Build a complete automated test suite for a web app covering login, forms, and API responses."
        },

        "JUnit": {
            "courses": [
                {"title": "JUnit & TDD – Udemy",
                 "url": "https://www.udemy.com/course/junit-and-mockito-up-and-running/"},
                {"title": "Unit Testing with JUnit – Coursera",
                 "url": "https://www.coursera.org/learn/software-testing-fundamentals"}
            ],
            "project": "Write a complete JUnit test suite for a Java Spring Boot REST API with mocking and code coverage."
        },

        "TestNG": {
            "courses": [
                {"title": "TestNG – Official Documentation",
                 "url": "https://testng.org/doc/documentation-main.html"},
                {"title": "Selenium with TestNG – Udemy",
                 "url": "https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/"}
            ],
            "project": "Create a TestNG test framework for a web application with parallel test execution and HTML reporting."
        },

        "API Testing": {
            "courses": [
                {"title": "API Testing with Postman – Udemy",
                 "url": "https://www.udemy.com/course/postman-the-complete-guide/"},
                {"title": "REST API Testing – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=VywxIQ2ZXw4"}
            ],
            "project": "Write a full API test suite using Postman/Newman covering positive, negative, and edge case scenarios."
        },

        "Performance Testing": {
            "courses": [
                {"title": "Performance Testing with JMeter – Udemy",
                 "url": "https://www.udemy.com/course/learn-jmeter-from-scratch-performance-load-testing-tool/"},
                {"title": "Load Testing – BlazeMeter University",
                 "url": "https://www.blazemeter.com/university"}
            ],
            "project": "Run a load test on a web application using JMeter, simulate 1000 concurrent users, and analyze results."
        },

        "Bug Tracking": {
            "courses": [
                {"title": "Jira for Beginners – Atlassian",
                 "url": "https://university.atlassian.com/student/catalog"},
                {"title": "Software QA & Bug Tracking – Udemy",
                 "url": "https://www.udemy.com/course/software-testing-courses/"}
            ],
            "project": "Set up a Jira project, log 20 real bugs with severity/priority, and manage them through resolution."
        },

        # ================= GAME DEVELOPMENT =================
        "Unity": {
            "courses": [
                {"title": "Unity Game Development",
                 "url": "https://www.coursera.org/specializations/game-development"}
            ],
            "project": "Build and publish a 2D platformer game."
        },

        "Unreal Engine": {
            "courses": [
                {"title": "Unreal Engine Learning Portal",
                 "url": "https://www.unrealengine.com/en-US/onlinelearning-courses"}
            ],
            "project": "Create a 3D interactive environment."
        },

        "3D Modeling": {
            "courses": [
                {"title": "Blender 3D – Blender Official Tutorials",
                 "url": "https://www.blender.org/support/tutorials/"},
                {"title": "3D Modeling for Games – Coursera",
                 "url": "https://www.coursera.org/learn/3d-modeling-blender"}
            ],
            "project": "Model, texture, and rig a 3D game character in Blender and export it to Unity."
        },

        "Animation": {
            "courses": [
                {"title": "3D Character Animation – Coursera",
                 "url": "https://www.coursera.org/learn/3d-character-animation"},
                {"title": "Unity Animation System – Unity Learn",
                 "url": "https://learn.unity.com/tutorial/working-with-animation-clips"}
            ],
            "project": "Create a full animation controller in Unity with idle, walk, run, and jump states using blend trees."
        },

        "Graphics Programming": {
            "courses": [
                {"title": "Computer Graphics – UC San Diego",
                 "url": "https://www.coursera.org/learn/computer-graphics"},
                {"title": "OpenGL Graphics Programming – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=45MIykWJ-C4"}
            ],
            "project": "Build a basic 3D rendering engine using OpenGL with lighting, textures, and camera movement."
        },

        "Shaders": {
            "courses": [
                {"title": "Shader Programming – The Book of Shaders",
                 "url": "https://thebookofshaders.com/"},
                {"title": "Unity Shader Graph – Unity Learn",
                 "url": "https://learn.unity.com/tutorial/introduction-to-shader-graph"}
            ],
            "project": "Write custom GLSL shaders for water, fire, and cel-shading effects in a Unity scene."
        },

        "Physics Engines": {
            "courses": [
                {"title": "Game Physics – Coursera",
                 "url": "https://www.coursera.org/learn/game-development"},
                {"title": "Unity Physics – Unity Learn",
                 "url": "https://learn.unity.com/tutorial/physics-in-unity"}
            ],
            "project": "Build a physics-based puzzle game in Unity using rigidbodies, colliders, joints, and forces."
        },

        "AI in Games": {
            "courses": [
                {"title": "AI for Games – Udemy",
                 "url": "https://www.udemy.com/course/ai_for_games/"},
                {"title": "Game AI – Unity Learn",
                 "url": "https://learn.unity.com/course/artificial-intelligence-for-beginners"}
            ],
            "project": "Implement game AI with finite state machines, A* pathfinding, and behavior trees in a Unity game."
        },

        # ================= UI / UX =================
        "Wireframing": {
            "courses": [
                {"title": "Google UX Design Professional Certificate",
                 "url": "https://www.coursera.org/professional-certificates/google-ux-design"}
            ],
            "project": "Design wireframes for a SaaS productivity app using Figma."
        },

        "Prototyping": {
            "courses": [
                {"title": "UX Design Process – Coursera",
                 "url": "https://www.coursera.org/learn/ux-design-process"}
            ],
            "project": "Create an interactive mobile app prototype."
        },

        "Figma": {
            "courses": [
                {"title": "Figma UI/UX Course – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=jwCmIBJ8Jtc"}
            ],
            "project": "Design a full mobile app UI kit with components."
        },

        "Adobe XD": {
            "courses": [
                {"title": "Adobe XD Tutorials",
                 "url": "https://helpx.adobe.com/xd/tutorials.html"}
            ],
            "project": "Prototype a complete e-commerce app."
        },

        "Sketch": {
            "courses": [
                {"title": "Sketch App Tutorials",
                 "url": "https://www.sketch.com/docs/"}
            ],
            "project": "Design a responsive website UI system."
        },

        "Photoshop": {
            "courses": [
                {"title": "Adobe Photoshop for Beginners",
                 "url": "https://www.adobe.com/learn/photoshop.html"}
            ],
            "project": "Create high-fidelity UI mockups."
        },

        "Illustrator": {
            "courses": [
                {"title": "Adobe Illustrator Tutorials",
                 "url": "https://helpx.adobe.com/illustrator/tutorials.html"}
            ],
            "project": "Design vector icons and branding assets."
        },

        "User Research": {
            "courses": [
                {"title": "User Experience Research – Coursera",
                 "url": "https://www.coursera.org/learn/user-research"}
            ],
            "project": "Conduct usability testing and produce UX report."
        },

        "Usability Testing": {
            "courses": [
                {"title": "UX Testing – Google UX Certificate",
                 "url": "https://www.coursera.org/professional-certificates/google-ux-design"}
            ],
            "project": "Run usability testing on a prototype and iterate."
        },

        "Interaction Design": {
            "courses": [
                {"title": "Interaction Design Specialization",
                 "url": "https://www.coursera.org/specializations/interaction-design"}
            ],
            "project": "Design interactive micro-animations for a web app."
        },

        # ================= DATA ENGINEERING =================
        "ETL": {
            "courses": [
                {"title": "Data Engineering on Google Cloud",
                 "url": "https://www.coursera.org/professional-certificates/gcp-data-engineering"}
            ],
            "project": "Build an end-to-end ETL pipeline using Python and Airflow."
        },

        "Hadoop": {
            "courses": [
                {"title": "Big Data Specialization – UC San Diego",
                 "url": "https://www.coursera.org/specializations/big-data"}
            ],
            "project": "Process large datasets using Hadoop MapReduce."
        },

        "Spark": {
            "courses": [
                {"title": "Apache Spark with Python",
                 "url": "https://www.coursera.org/projects/apache-spark"}
            ],
            "project": "Build a real-time analytics system with Spark."
        },

        "Kafka": {
            "courses": [
                {"title": "Apache Kafka for Developers",
                 "url": "https://www.udemy.com/course/apache-kafka/"}
            ],
            "project": "Implement a real-time event streaming pipeline."
        },

        "Airflow": {
            "courses": [
                {"title": "Apache Airflow Fundamentals",
                 "url": "https://www.astronomer.io/guides/airflow/"}
            ],
            "project": "Schedule and monitor data workflows."
        },

        # ================= CLOUD =================
        "Azure": {
            "courses": [
                {"title": "Microsoft Azure Fundamentals",
                 "url": "https://www.coursera.org/learn/microsoft-azure-fundamentals"}
            ],
            "project": "Deploy a scalable web app using Azure services."
        },

        "Google Cloud": {
            "courses": [
                {"title": "Google Cloud Fundamentals",
                 "url": "https://www.coursera.org/learn/gcp-fundamentals"}
            ],
            "project": "Deploy containerized apps on Google Cloud."
        },

        # ================= EMBEDDED SYSTEMS =================
        "Microcontrollers": {
            "courses": [
                {"title": "Embedded Systems Specialization",
                 "url": "https://www.coursera.org/specializations/embedded-systems"}
            ],
            "project": "Build an IoT-based temperature monitoring system."
        },

        "RTOS": {
            "courses": [
                {"title": "Real-Time Embedded Systems",
                 "url": "https://www.coursera.org/learn/real-time-embedded-systems"}
            ],
            "project": "Develop RTOS-based task scheduling project."
        },

        "ARM": {
            "courses": [
                {"title": "ARM Cortex-M Architecture – Udemy",
                 "url": "https://www.udemy.com/course/arm-cortex-m-assembly-programming/"},
                {"title": "Embedded Systems with ARM – Coursera",
                 "url": "https://www.coursera.org/specializations/embedded-systems-security"}
            ],
            "project": "Program an ARM Cortex-M microcontroller to read sensors and transmit data over UART."
        },

        "Assembly": {
            "courses": [
                {"title": "Assembly Language Programming – Udemy",
                 "url": "https://www.udemy.com/course/x86-asm-foundations/"},
                {"title": "x86 Assembly – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=VQAKkuLL31g"}
            ],
            "project": "Write an x86 Assembly program that implements basic arithmetic, memory access, and I/O operations."
        },

        "UART": {
            "courses": [
                {"title": "Embedded Communication Protocols – Udemy",
                 "url": "https://www.udemy.com/course/embedded-systems-communication-protocols/"},
                {"title": "UART, I2C, SPI – Coursera Embedded Systems",
                 "url": "https://www.coursera.org/specializations/embedded-systems"}
            ],
            "project": "Implement UART communication between two microcontrollers to exchange sensor data."
        },

        "I2C": {
            "courses": [
                {"title": "I2C Protocol – Embedded Systems Coursera",
                 "url": "https://www.coursera.org/specializations/embedded-systems"},
                {"title": "I2C Communication – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=6IAkYpmA1DQ"}
            ],
            "project": "Interface multiple I2C sensors (temperature, humidity) with a microcontroller and display data on an LCD."
        },

        "SPI": {
            "courses": [
                {"title": "SPI Protocol – Embedded Systems Coursera",
                 "url": "https://www.coursera.org/specializations/embedded-systems"},
                {"title": "SPI Communication – Udemy Embedded",
                 "url": "https://www.udemy.com/course/embedded-systems-communication-protocols/"}
            ],
            "project": "Use SPI to interface a microcontroller with an SD card module for data logging."
        },

        "PCB Design": {
            "courses": [
                {"title": "PCB Design with KiCad – Udemy",
                 "url": "https://www.udemy.com/course/kicad-pcb-design/"},
                {"title": "PCB Design – Coursera",
                 "url": "https://www.coursera.org/learn/pcb-design"}
            ],
            "project": "Design a PCB for a custom Arduino-based sensor board in KiCad, including schematic and layout."
        },
    }

    # ===== BUILD ROADMAP =====
    roadmap = []
    missing_skills = gap_analysis.get("missingSkills", [])

    for skill in missing_skills:
        # ── Step 1: try the hardcoded dictionary (covers 99% of cases, zero API cost) ──
        resource = SKILL_RESOURCES.get(skill)

        # ── Step 2: only if truly not found, call GPT (rare — keeps API usage minimal) ──
        if resource is None:
            print(f"[GPT fallback] Skill '{skill}' not in dictionary — calling API")
            resource = _gpt_fallback(skill)

        roadmap.append({
            "skill":               skill,
            "recommended_courses": resource["courses"],
            "mini_project":        resource["project"],
            "estimated_time":      "2–3 weeks"
        })

    return roadmap