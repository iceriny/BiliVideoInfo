import json
import zipfile
import os
import requests

import pyperclip  # 三方输出到剪切板块
from github import Github  # 三方github包

tokenPath = "private/Personal master key.json"
'''
json数据格式: 
{
    "token": "**************************"
}
'''
locally_package = False  # 是否本地打包


def set_manifest() -> dict:
    return_data = {}
    return_data["changed"] = False # 标记是否有修改

    already_edited = False
    with open("manifest.json", "r", encoding="utf-8") as json_file:
        data = json.load(json_file)

    with open("packagerInfo.json", "r", encoding="utf-8") as json_file:
        packagerInfo = json.load(json_file)
        
    last_updated = get_last_changelog(packagerInfo) # 获取最后一次更新的信息
    package_name = packagerInfo["package_name"] # 获取包名
    return_data["package_name"] = package_name # 写入返回数据=>package_name
    return_data["description"] = last_updated["description"] # 写入返回数据=>description

    packagerInfo_description = packagerInfo["description"]
    if data["description"] != packagerInfo_description:
        input_text = input(
            f"当前简介:{data['description']}\n是否修改为packagerInfo.json中的简介?\ny/n\n"
        )
        if input_text == "y":
            data["description"] = packagerInfo_description
            already_edited = True
    else:
        print("简介与packagerInfo.json中的简介一致，不用修改，如果需要修改，请修改packagerInfo.json中的简介")

    last_version = last_updated["version"]
    if data["version"] != last_version:
        input_text = input(
            f"当前清单中的版本号为:{data['version']}\n是否修改版本号为packagerInfo.json中最新的版本号({last_version})?\ny/n\n"
        )
        if input_text == "y":
            data["version"] = last_version
            already_edited = True
            return_data["changed"] = True
    else:
        print("版本号与最后的Changelog版本号一致，不用修改，如果需要修改，请修改packagerInfo.json中的版本号")
    return_data["version"] = last_version # 写入返回数据中版本号

    text_to_copy = f"{data['version']}\n\n{data['description']}\n\n{last_updated['description']}"
    pyperclip.copy(text_to_copy)

    if already_edited:
        with open("manifest.json", "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
    name = get_last_changelog(packagerInfo)["name"]
    return_data["name"] = name # 写入返回数据 => 更新名
    return return_data


def get_last_changelog(data) -> str:
    changelog = data["changelog"]
    last_changelog = changelog[0]

    return last_changelog


def zip_to_package(package_name: str):
    files_list = [
        ".\\css",
        ".\\img",
        ".\\scripts",
        ".\\options",
        ".\\manifest.json",
        ".\\_locales",
    ]

    folder_path = ".\\ignore\\"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    with zipfile.ZipFile(f".\\ignore\\{package_name}.zip", "w") as zipf:
        for path in files_list:
            if os.path.isdir(path):
                for root, dirs, files in os.walk(path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path, os.path.relpath(file_path, "."))
            else:
                zipf.write(path, os.path.basename(path))


def release_package(return_data: dict):
    with open(tokenPath, "r", encoding="utf-8") as json_file:
        token = json.load(json_file)["token"]
        print(f"你的令牌: {token}")

    repo_owner = "iceriny"
    repo_name = "BiliVideoInfo"
    # 创建 GitHub 对象并进行认证
    g = Github(token)
    # 获取存储库对象
    repo = g.get_repo(f"{repo_owner}/{repo_name}")
    # 创建发布
    release = repo.create_git_release(
        tag=f"v{return_data['version']}",  # 发布标签名
        name=f"{return_data['name']}",  # 发布名称
        message=f"{return_data['description']}",  # 发布说明
        target_commitish="main",  # 分支名称
    )

    # 上传文件到发布
    try:
        gitReleaseAsset = release.upload_asset(f".\\ignore\\{return_data['package_name']}.zip", label=f"{return_data['package_name']}.zip")
    except Exception as e:
        print(f"上传失败：{e}")
        return
    else:
        print("上传成功")
        print(gitReleaseAsset)


"""     token = ""

    with open(tokenPath, "r", encoding="utf-8") as json_file:
        token = json.load(json_file)["token"]
        print(f'你的令牌: {token}')

    repo_owner = "iceriny"
    repo_name = "BiliVideoInfo"

    release_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/releases"

    if os.path.exists(f".\\ignore\\{return_data['package_name']}.zip"):
        headers = {
            "Authorization": f"token {token}",
            "Content-Type": "application/zip",
        }
        release_data = {
            "tag_name": f"{return_data['version']}",
            "target_commitish": "master",
            "name": f"{return_data['version']}",
            "body": f"{return_data['description']}",
            "draft": False,
            "prerelease": False,
        }
        files = {
            "file": open(f".\\ignore\\{return_data['package_name']}.zip", "rb")
        }  # 上传的文件

        response = requests.post(
            release_url, headers=headers, data=release_data, files=files
        )

        if response.status_code == 201:
            print("文件上传到GitHub发布。")
        else:
            print(f"上传文件失败。状态码: {response.status_code}") """


if __name__ == "__main__":
    return_data = set_manifest()

    if return_data["changed"]:
        zip_to_package(return_data["package_name"])
        if locally_package == False:
            release_package(return_data)
    else:
        print('没有更新或未修改"packagerInfo.json"文件')
