package main

import (
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

func main() {
	r := gin.Default()

	r.Static("/web", "./web/client/dist")
	r.Use(cors.Cors())             //开启中间件 允许使用跨域请求
	r.MaxMultipartMemory = 8 << 21 // 16 MiB

	r.POST("/upload", func(c *gin.Context) {
		utils.Upload("./web/public/upload/", c, "3D文件上传成功")
	})

	r.Run(":8088")
}
