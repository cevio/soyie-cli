# Soyie-cli #

配合soyie-mvvm框架的一整套前端流程开发体系

## installtion ##

> $ npm install -g soyie-cli

## so create project ##

创建一个项目

``` html
so create project [project-name] [-f [-b [-j]]]
```

  * -f, --force 强制覆盖
  * -b, --bootstrap 使用bootstrap样式和javascript
  * -j, --jquery 使用jQuery库

我们会自带`soyie`框架到项目

## so create file ##

在已有项目中创建一个新到项目文件

``` html
so create file [file-name] [-f]
```

  * -f, --force 强制覆盖

便于省去自己写如css和js地址到麻烦，一键生成。

## so build ##

编译你的项目到dist文件夹下。dist文件夹被认为发布文件夹。

``` html
so build
```

## so server ##

在某个项目下启动WEB服务。

> $ cd your-project

> $ so server

port默认8000端口。

> $ so server 9000

启动端口为9000的WEB服务。

但是也有个参数

  * -i, --ip 设置服务IP

``` html
so server 9001 -i 192.168.1.34
```

创建了一个基于 `192.168.1.34:9001` 的服务。

## so regist ##

注册一个新的用户

## so login ##

登陆服务。有些功能是需要登陆后才能使用的

## so whoami ##

查看我的登陆状态

## so publish ##

向51内部服务器发送一个组件，可以通过install命令来获取

``` html
$ cd your-coms-root-dir
$ so publish
```

## so install ##

安装一个内部模块

``` html
so install jquery
so install --save jquery
so install jquery --version 2.1.4
so install --save jquery --version 2.1.4
```

## so uninstall ##

卸载一个模块

``` html
so uninstall jquery
so uninstall --save jquery
```

## so update ##

更新全局资源包或者项目资源包

``` html
so update -g
# 将更新整个系统内部的资源包到最新
```

``` html
cd your-project
so update
# 将这个项目中指定的资源更新到最新
```

## License ##

MIT