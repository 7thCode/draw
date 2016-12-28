# minimum electron-template

  Electronのテンプレート
  
##File Config
    
       ├── index.ts                     Entry point
       ├── package.json                 
       ├── renderer                     for Renderer 
       │   ├── bower.json
       │   ├── javascripts
       │   │   ├── application.ts
       │   │   └── controller.ts
       │   ├── stylesheets
       │   │   └── style.less
       │   └── views
       │       └── index.pug
       └── system                       for Browser 
           └── main.ts
           
           
##実行
    
    sudo npm install
    
    
    electron .
    
    
##パッケージング
    
     electron -v   
     v1.4.13
            
     electron-packager . APP_NAME --platform=darwin --arch=x64 --version=1.4.13 --icon=app_name.icns
        