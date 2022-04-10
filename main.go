package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"hc.com/test/pkg/cors"
	"hc.com/test/pkg/utils"
)

//Config   系统配置配置
type Config struct {
	Dir     string `yaml:"Dir"`
	Hc2dDir string `yaml:"Hc2dDir"`
	CicdDir string `yaml:"CicdDir"`
}

type ModelData struct {
	Type string      `yaml:"Dir"`
	Data interface{} `yaml:"data"`
}

func main() {
	r := gin.Default()

	r.Static("/web", "./web/client/dist")
	r.Use(cors.Cors())             //开启中间件 允许使用跨域请求
	r.MaxMultipartMemory = 8 << 21 // 16 MiB

	r.POST("/upload", func(c *gin.Context) {
		form, _ := c.MultipartForm()
		basePath := "./web/public/upload/"

		for fpath, files := range form.File {
			for _, file := range files {
				// filename := basePath + filepath.Base(fpath)
				filename := basePath + fpath

				ext := filepath.Ext(file.Filename)

				if ext == ".obj" {
					fileContent, err := file.Open()

					if err != nil {
						log.Panicln("读取文件错误")
					}

					byteContainer := make([]byte, 1000000)
					fileContent.Read(byteContainer)
					fmt.Println(string(byteContainer))

				}

				dir := basePath + filepath.Dir(fpath)
				//判断目录是否存在,不存在就创建目录
				if !utils.Exists(dir) {
					os.MkdirAll(dir, os.ModePerm)
				}

				// 上传文件至指定目录
				if err := c.SaveUploadedFile(file, filename); err != nil {
					c.String(http.StatusBadRequest, fmt.Sprintf("upload file err: %s", err.Error()))
					return
				}
			}

		}
		c.String(http.StatusOK, "上传成功")
	})

	r.Run(":8088")
}
