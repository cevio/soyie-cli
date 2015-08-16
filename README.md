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

## License ##

MIT