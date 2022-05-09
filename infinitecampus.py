from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import subprocess

url = "https://adfs.svvsd.org/adfs/ls/?client-request-id=cd388547-ac70-46bf-ad73-2f7195983ae3&username=&wa=wsignin1.0&wtrealm=urn%3afederation%3aMicrosoftOnline&wctx=estsredirect%3d2%26estsrequest%3drQQIARAA42KwUs4oKSkottLXz0zWKy4rK07Ryy9K109OzC0oLdYvLikrSszMKxLiEnBvtThbsGa_29pi_cKpM6wez2LkhCtfxaiDz5TgYH-YSfrBnsH6hxgV4y2TzEwSk9OME9MMkiwMjIxTkswNLQ2TTQ2TDBNTTZItLzAyvmBkvMXEGpyYm2M0i5kHbkJxZvEmZhXjVHPLJENDC10L0xQTXZMkM1PdxMRUU91Uc7OUJCMTYwOTJIsLLDyvWHgMWK04OLgE-CXYFBh-sDAuYgV6xl7zgKn24YtOzcGB01er-TGcYtUvL7WoKvRPLim39ExOqaoIz_epDM9NNYrwCEj2S_N2KsvxcksuCfD2LNYOtDW0MpzAxnuKjeEDG2MHO8MsdoYDnIwHeBl-8E2d2NK1ZG_PWw8A0#"

chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
# chrome_options.add_argument('--headless')

driver = webdriver.Chrome(options=chrome_options)
driver.get(url)
username = driver.find_element(By.ID, "userNameInput")
password = driver.find_element(By.ID, "passwordInput")
submit= driver.find_element(By.ID, "submitButton")

username.send_keys("Ge.Justin23")
password.send_keys(os.environ["PASSWORD"])
submit.click()
wait = WebDriverWait(driver, 10)
wait.until(EC.url_to_be('https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/today'))
driver.get("https://ic.svvsd.org/campus/nav-wrapper/student/portal/student/grades")
cmd='echo '+driver.page_source+'|pbcopy'
subprocess.check_call(cmd, shell=True)