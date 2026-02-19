# learning_path_gen.py

def generate_learning_path(gap_analysis):
    """
    Generates a high-quality learning roadmap based on missing skills.
    Uses ONLY trusted, globally recognized learning platforms.
    Explicitly includes major tech stacks from job_skills_data.json.
    Clean fallback for anything not listed.
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

        "R": {
            "courses": [
                {"title": "R Programming – Johns Hopkins",
                 "url": "https://www.coursera.org/learn/r-programming"}
            ],
            "project": "Perform statistical data analysis on real-world datasets."
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

        # ================= BACKEND =================
        "Node.js": {
            "courses": [
                {"title": "Node & Express – freeCodeCamp",
                 "url": "https://www.youtube.com/watch?v=Oe421EPjeBE"}
            ],
            "project": "Build a secure REST API with JWT + MongoDB."
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

        # ================= BLOCKCHAIN =================
        "Solidity": {
            "courses": [
                {"title": "Ethereum & Solidity Developer Course",
                 "url": "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/"}
            ],
            "project": "Develop and deploy a smart contract on Ethereum testnet."
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

        # ================= EMBEDDED =================
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
        }
    }

    # ===== BUILD ROADMAP =====
    roadmap = []
    missing_skills = gap_analysis.get("missingSkills", [])

    for skill in missing_skills:
        resource = SKILL_RESOURCES.get(skill, {
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
        })

        roadmap.append({
            "skill": skill,
            "recommended_courses": resource["courses"],
            "mini_project": resource["project"],
            "estimated_time": "2–3 weeks"
        })

    return roadmap
