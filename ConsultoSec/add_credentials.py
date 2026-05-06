import os
import glob

files = glob.glob('frontend/src/features/*/services/*.ts')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # We want to insert `credentials: "include",` in fetch calls.
    # The fetch calls look like:
    # await fetch(`...`, {
    #   method: "...",
    #   headers: {
    content = content.replace(
        'method: "GET",\n      headers: {',
        'method: "GET",\n      credentials: "include",\n      headers: {'
    ).replace(
        'method: "POST",\n      headers: {',
        'method: "POST",\n      credentials: "include",\n      headers: {'
    ).replace(
        'method: "PATCH",\n      headers: {',
        'method: "PATCH",\n      credentials: "include",\n      headers: {'
    ).replace(
        'method: "DELETE",\n      headers: {',
        'method: "DELETE",\n      credentials: "include",\n      headers: {'
    )
    
    with open(f, 'w') as file:
        file.write(content)

