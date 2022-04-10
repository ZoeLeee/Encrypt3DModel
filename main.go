package main

import (
	"github.com/gin-gonic/gin"
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

	r.MaxMultipartMemory = 8 << 21 // 16 MiB

	r.POST("/publish", func(c *gin.Context) {
		// utils.Upload(config.Dir, c, "3D文件上传成功")
	})

	r.Run(":8088")
}
