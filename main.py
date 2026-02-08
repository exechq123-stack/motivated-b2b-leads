"""
Hacker News Lead Scraper - Apify Actor
Scrapes Hacker News for founder-type users discussing business problems
Uses the official HN API (completely free and legal)
"""

from apify import Actor
import requests
import re
from datetime import datetime, timedelta
import time

class HackerNewsLeadScraper:
    def __init__(self):
        """Initialize HN API client"""
        self.base_url = "https://hacker-news.firebaseio.com/v0"
        self.algolia_url = "https://hn.algolia.com/api/v1"
        
    def is_founder(self, user_about, text=""):
        """
        Detect if user is a founder/business owner
        Returns: (bool, confidence_score)
        """
        if not user_about:
            return False, 0
        
        about_lower = user_about.lower()
        text_lower = text.lower() if text else ""
        
        # Founder signals
        founder_phrases = [
            r'\bfounder\b',
            r'\bceo\b',
            r'\bco-founder\b',
            r'\bcreator of\b',
            r'\bbuilding\b',
            r'\bbuilt\b',
            r'\bstarted\b',
            r'\bowner\b',
            r'\bcto\b',
            r'\bentrepreneur\b'
        ]
        
        # Employee/job seeker exclusions
        exclusion_phrases = [
            r'\blooking for work\b',
            r'\bseeking opportunities\b',
            r'\bavailable for hire\b',
            r'\bopen to offers\b'
        ]
        
        # Check for exclusions first
        for phrase in exclusion_phrases:
            if re.search(phrase, about_lower):
                return False, 0
        
        # Count founder signals
        score = 0
        for phrase in founder_phrases:
            if re.search(phrase, about_lower):
                score += 1
            if text and re.search(phrase, text_lower):
                score += 0.5
        
        # Convert to confidence percentage
        is_founder_flag = score >= 1
        confidence = min(int(score * 30), 100)
        
        return is_founder_flag, confidence
    
    def extract_website(self, text):
        """Extract website URL from text"""
        if not text:
            return None
        
        # Look for URLs
        url_pattern = r'https?://(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:/[^\s]*)?)'
        matches = re.findall(url_pattern, text)
        
        # Filter out common non-business domains
        excluded_domains = [
            'twitter.com', 'github.com', 'linkedin.com',
            'facebook.com', 'ycombinator.com', 'news.ycombinator.com'
        ]
        
        for match in matches:
            # match is just domain or domain/path
            domain = match.split('/')[0]
            if not any(excluded in domain for excluded in excluded_domains):
                return f"https://{match}"
        
        return None
    
    def extract_company_name(self, text):
        """Extract company/product name from text"""
        if not text:
            return None
        
        # Common patterns in HN profiles
        patterns = [
            r'(?:founder of |creator of |building |built )([A-Z][a-zA-Z\s]{2,30})',
            r'(?:working on |started )([A-Z][a-zA-Z\s]{2,30})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                company = match.group(1).strip()
                # Basic validation
                if 3 <= len(company) <= 50:
                    return company
        
        return None
    
    def extract_pain_points(self, text):
        """Extract mentioned problems/challenges"""
        if not text:
            return []
        
        pain_patterns = [
            (r'struggling with ([^.!?]+)', 'struggling with'),
            (r'challenge (?:with|of) ([^.!?]+)', 'challenge with'),
            (r'problem (?:with|is) ([^.!?]+)', 'problem with'),
            (r'difficult to ([^.!?]+)', 'difficult to'),
            (r'hard to ([^.!?]+)', 'hard to'),
            (r'need (?:help|advice) (?:with|on) ([^.!?]+)', 'need help with'),
        ]
        
        pain_points = []
        text_lower = text.lower()
        
        for pattern, prefix in pain_patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                problem = match.group(1).strip()
                # Keep it concise
                if len(problem) < 100:
                    pain_points.append(f"{prefix} {problem}")
        
        return pain_points[:3]  # Max 3
    
    async def get_user_details(self, username):
        """Get HN user profile details"""
        try:
            url = f"{self.base_url}/user/{username}.json"
            response = requests.get(url)
            
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            Actor.log.error(f"Error fetching user {username}: {str(e)}")
            return None
    
    async def search_comments(self, query, max_results=100, days_back=30):
        """
        Search HN comments using Algolia
        """
        Actor.log.info(f"Searching comments for: {query}")
        
        # Calculate timestamp
        cutoff_date = datetime.now() - timedelta(days=days_back)
        timestamp = int(cutoff_date.timestamp())
        
        try:
            url = f"{self.algolia_url}/search"
            params = {
                'query': query,
                'tags': 'comment',
                'numericFilters': f'created_at_i>{timestamp}',
                'hitsPerPage': max_results
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            return data.get('hits', [])
        except Exception as e:
            Actor.log.error(f"Error searching: {str(e)}")
            return []
    
    async def search_stories(self, query, max_results=100, days_back=30):
        """
        Search HN stories (Ask HN, Show HN, etc.)
        """
        Actor.log.info(f"Searching stories for: {query}")
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        timestamp = int(cutoff_date.timestamp())
        
        try:
            url = f"{self.algolia_url}/search"
            params = {
                'query': query,
                'tags': 'story',
                'numericFilters': f'created_at_i>{timestamp}',
                'hitsPerPage': max_results
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            return data.get('hits', [])
        except Exception as e:
            Actor.log.error(f"Error searching stories: {str(e)}")
            return []
    
    async def process_item(self, item, search_query):
        """Process a HN comment or story into a lead"""
        author = item.get('author')
        
        if not author:
            return None
        
        # Get user profile
        user_data = await self.get_user_details(author)
        
        if not user_data:
            return None
        
        user_about = user_data.get('about', '')
        karma = user_data.get('karma', 0)
        
        # Check if founder
        item_text = item.get('comment_text') or item.get('story_text') or item.get('title', '')
        is_founder_flag, confidence = self.is_founder(user_about, item_text)
        
        if not is_founder_flag:
            return None  # Skip non-founders
        
        # Extract data
        website = self.extract_website(user_about)
        company = self.extract_company_name(user_about)
        pain_points = self.extract_pain_points(item_text)
        
        # Determine if this is a comment or story
        item_type = 'comment' if 'comment_text' in item else 'story'
        
        lead = {
            # HN data
            'hn_username': author,
            'hn_karma': karma,
            'hn_about': user_about[:500] if user_about else '',  # Truncate
            'hn_item_id': item.get('objectID'),
            'hn_url': f"https://news.ycombinator.com/item?id={item.get('objectID')}",
            'item_type': item_type,
            'item_text': item_text[:500] if item_text else '',
            'created_at': datetime.fromtimestamp(item.get('created_at_i', 0)).isoformat(),
            
            # Extracted business data
            'is_founder': True,
            'founder_confidence': confidence,
            'website': website,
            'company_name': company,
            'pain_points': pain_points,
            
            # Metadata
            'search_query': search_query,
            'scraped_at': datetime.now().isoformat()
        }
        
        return lead


async def main():
    """
    Main actor entry point
    """
    async with Actor:
        # Get input
        actor_input = await Actor.get_input() or {}
        
        # Configuration
        search_queries = actor_input.get('searchQueries', [
            'lead generation',
            'marketing automation',
            'sales process',
            'customer acquisition',
            'built a tool for'
        ])
        
        search_type = actor_input.get('searchType', 'both')  # 'comments', 'stories', or 'both'
        max_results_per_query = actor_input.get('maxResultsPerQuery', 50)
        days_back = actor_input.get('daysBack', 30)
        
        Actor.log.info("=== Hacker News Lead Scraper Starting ===")
        Actor.log.info(f"Search queries: {search_queries}")
        Actor.log.info(f"Search type: {search_type}")
        Actor.log.info(f"Max results per query: {max_results_per_query}")
        Actor.log.info(f"Looking back: {days_back} days")
        
        # Initialize scraper
        scraper = HackerNewsLeadScraper()
        
        all_leads = []
        
        # Process each search query
        for query in search_queries:
            Actor.log.info(f"Processing query: {query}")
            
            # Search comments
            if search_type in ['comments', 'both']:
                comments = await scraper.search_comments(
                    query, 
                    max_results=max_results_per_query,
                    days_back=days_back
                )
                
                Actor.log.info(f"Found {len(comments)} comments for '{query}'")
                
                for comment in comments:
                    lead = await scraper.process_item(comment, query)
                    if lead:
                        all_leads.append(lead)
                        Actor.log.info(f"Found founder lead: {lead['hn_username']} (confidence: {lead['founder_confidence']}%)")
                    
                    # Small delay to be respectful
                    time.sleep(0.5)
            
            # Search stories
            if search_type in ['stories', 'both']:
                stories = await scraper.search_stories(
                    query,
                    max_results=max_results_per_query,
                    days_back=days_back
                )
                
                Actor.log.info(f"Found {len(stories)} stories for '{query}'")
                
                for story in stories:
                    lead = await scraper.process_item(story, query)
                    if lead:
                        all_leads.append(lead)
                        Actor.log.info(f"Found founder lead: {lead['hn_username']} (confidence: {lead['founder_confidence']}%)")
                    
                    time.sleep(0.5)
        
        # Remove duplicates (same username)
        unique_leads = {}
        for lead in all_leads:
            username = lead['hn_username']
            # Keep the one with highest confidence
            if username not in unique_leads or lead['founder_confidence'] > unique_leads[username]['founder_confidence']:
                unique_leads[username] = lead
        
        final_leads = list(unique_leads.values())
        
        # Sort by confidence
        final_leads.sort(key=lambda x: x['founder_confidence'], reverse=True)
        
        # Statistics
        Actor.log.info("=== Scraping Complete ===")
        Actor.log.info(f"Total items found: {len(all_leads)}")
        Actor.log.info(f"Unique founder leads: {len(final_leads)}")
        Actor.log.info(f"With website: {sum(1 for l in final_leads if l['website'])}")
        Actor.log.info(f"With company name: {sum(1 for l in final_leads if l['company_name'])}")
        Actor.log.info(f"With pain points: {sum(1 for l in final_leads if l['pain_points'])}")
        
        # Average confidence
        if final_leads:
            avg_confidence = sum(l['founder_confidence'] for l in final_leads) / len(final_leads)
            Actor.log.info(f"Average confidence: {avg_confidence:.1f}%")
        
        # Push to dataset
        await Actor.push_data(final_leads)
        
        Actor.log.info("Data pushed to dataset successfully")


# Entry point
if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
