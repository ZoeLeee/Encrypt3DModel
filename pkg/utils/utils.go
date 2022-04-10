package utils

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// 判断所给路径文件/文件夹是否存在
func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

func Upload(basePath string, c *gin.Context, msg string) {
	// Multipart form
	form, _ := c.MultipartForm()

	fmt.Println(basePath)

	for fpath, files := range form.File {
		for _, file := range files {
			// filename := basePath + filepath.Base(fpath)
			filename := basePath + fpath

			dir := basePath + filepath.Dir(fpath)
			//判断目录是否存在,不存在就创建目录
			if !Exists(dir) {
				os.MkdirAll(dir, os.ModePerm)
			}

			// 上传文件至指定目录
			if err := c.SaveUploadedFile(file, filename); err != nil {
				c.String(http.StatusBadRequest, fmt.Sprintf("upload file err: %s", err.Error()))
				return
			}
		}

	}
	c.String(http.StatusOK, msg)
}
