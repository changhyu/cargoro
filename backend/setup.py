from setuptools import setup, find_packages

setup(
    name="cargoro-backend",
    version="0.1.0",
    description="CarGoro Backend Services",
    author="Your Name",
    packages=find_packages(include=["services", "services.*", "shared", "shared.*", "tests", "tests.*"]),
    install_requires=[
        # Backend dependencies
        # e.g., "fastapi", "pytest", "pytest-asyncio", "passlib", etc.
    ],
    include_package_data=True,
    zip_safe=False,
)
