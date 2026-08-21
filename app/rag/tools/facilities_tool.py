from langchain_core.tools import tool
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def get_common_chrome_options():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new") # Run in background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--blink-settings=imagesEnabled=false") # Don't load images (much faster)
    chrome_options.add_argument("--window-size=1920,1080")
    return chrome_options

@tool
def find_nearby_facilities(disease: str, facility_type: str, lat: float, lon: float) -> str:
    """
    Scrapes Google Maps to find top-rated nearby hospitals, clinics, or ambulances based on GPS coordinates.
    
    Args:
        disease: The condition the user has (e.g., 'heart', 'headache', 'migraine', 'general'). Pass 'general' if unknown.
        facility_type: Must be either 'hospital' or 'ambulance'.
        lat: Latitude of the user.
        lon: Longitude of the user.
    
    Returns:
        A string containing a formatted list of the top 5 nearby facilities (name, rating, phone, link) or an error message.
    """
    coords = f"{lat},{lon}"
    chrome_options = get_common_chrome_options()
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        # Fallback to local chromedriver if manager fails
        try:
            driver = webdriver.Chrome(options=chrome_options)
        except Exception as e2:
            return f"Error initializing browser: {str(e2)}"
    
    wait = WebDriverWait(driver, 15) 
    facilities = []

    try:
        driver.get(f"https://www.google.com/maps/search/{coords}")

        nearby_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, '//button[contains(@aria-label,"Nearby")]'))
        )
        nearby_btn.click()
        time.sleep(1)

        # Construct search query
        if facility_type.lower() == 'ambulance':
            search_query = "ambulance service"
        else:
            if disease and disease.lower() != 'general':
                search_query = f"{disease} hospitals clinics"
            else:
                search_query = "hospitals clinics"

        active_element = driver.switch_to.active_element
        active_element.send_keys(search_query)
        active_element.send_keys("\n")

        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "Nv2PK")))
        time.sleep(2)

        cards = driver.find_elements(By.CLASS_NAME, "Nv2PK")

        for card in cards:
            try:
                name = card.find_element(By.CLASS_NAME, "qBF1Pd").text
                try:
                    rating = card.find_element(By.CLASS_NAME, "MW4etd").text
                    rating_float = float(rating)
                except:
                    rating_float = 0.0

                try:
                    phone = card.find_element(By.CLASS_NAME, "UsdlK").text
                except:
                    phone = "N/A"

                link = card.find_element(By.CLASS_NAME, "hfpxzc").get_attribute("href")

                facilities.append({
                    "name": name,
                    "rating": rating_float,
                    "phone": phone,
                    "link": link
                })
            except:
                continue

        sorted_facilities = sorted(facilities, key=lambda x: x["rating"], reverse=True)[:5]
        
        if not sorted_facilities:
            return "No facilities found for this location."
            
        # Format as string for the LLM
        output = f"Top 5 nearby {facility_type}s:\n\n"
        for idx, f in enumerate(sorted_facilities, 1):
            output += f"{idx}. **{f['name']}**\n"
            output += f"   - Rating: {f['rating']}⭐\n"
            output += f"   - Phone: {f['phone']}\n"
            output += f"   - [Google Maps Link]({f['link']})\n\n"
            
        return output

    except Exception as e:
        return f"Error finding facilities: {str(e)}"
    finally:
        driver.quit()
