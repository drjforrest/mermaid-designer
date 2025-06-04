from setuptools import setup, find_packages

setup(
    name="mermaid-designer-desktop",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "pywebview>=4.3.3",
        "packaging"
    ],
    entry_points={
        "console_scripts": [
            "mermaid-designer=src.main:main"
        ]
    },
    author="Your Name",
    description="Desktop wrapper for Mermaid Designer",
    keywords="mermaid, diagram, designer, desktop",
    python_requires=">=3.8",
)
