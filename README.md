# [WIP]copyparty-config-editor
This is a HTML basededitor for config files for the fileserver copyparty (https://github.com/9001/copyparty) written by the LLM Gemini. 


I'll probably add translations in the future and a quick manual. 

I'll not add a graphical way to edit the global settings, since copyparty has a ton of options. I see this editor as a way to quickly edit a existing config file and usually that means shares and users get edited. 

#The Idea:
- read a existing file
- GUI for users / groups and shares
- advanced mode for everything the gui can't do
- Bash one liner to backup and renew the existing config
- The html file could be made accessible through a Admin only share and therefore it would be possible to acess the editor from within the fileserver
- generates "good enough" initial passwords for new users until the user replaces them. 


#additional:
the old versions are the point where the LLM kept breaking stuff and the approach became unrecoverable, not sure if i'll ever need them again. 
