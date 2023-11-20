import json
import zipfile
import os
# 三方输出到剪切板块
import pyperclip


def set_manifest() -> str:
    already_edited = False
    with open('manifest.json', 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)
        
    with open('packagerInfo.json', 'r', encoding='utf-8') as json_file:
        packagerInfo = json.load(json_file)    
    
    package_name = packagerInfo['package_name']
    
    input_text = input(f"当前简介:{data['description']}\n是否修改简介?\ny/n")
    
    if input_text == 'y':
        data['description'] = input("请输入简介:")
        already_edited = True
    
    input_text = input(f"当前版本号为:{data['version']}\n是否修改版本号?\ny/n")
    if input_text == 'y':
        data['version'] = input("请输入版本号:")
        already_edited = True
        
    text_to_copy = f"{data['version']}\n\n{data['description']}\n\n{get_last_changelog(packagerInfo)}"
    pyperclip.copy(text_to_copy)
    
    if already_edited:
        with open('manifest.json', 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
            
    return package_name

def get_last_changelog(data) -> str:
    changelog = data['changelog']
    last_changelog = changelog[0]
    
    result = last_changelog['description']
    return result

def zip_to_package(package_name : str):
    files_list = [
        ".\\css",
        ".\\img",
        ".\\scripts",
        ".\\manifest.json",
        ".\\_locales",
    ]
    
    folder_path = ".\\ignore\\"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    with zipfile.ZipFile(f'.\\ignore\\{package_name}.zip', 'w') as zipf:
        for path in files_list:
            if os.path.isdir(path):
                for root, dirs, files in os.walk(path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, os.path.relpath(file_path, '.'))
            else:
                zipf.write(path, os.path.basename(path))
            
if __name__ == '__main__':
    package_name = set_manifest()
    zip_to_package(package_name)