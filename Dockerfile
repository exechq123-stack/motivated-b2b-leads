# Use Apify's base Python image
FROM apify/actor-python:3.11

# Copy all files
COPY . ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the actor
CMD ["python", "-m", "src.main"]
