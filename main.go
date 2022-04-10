package main

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/gob"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

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

func PKCS7Padding(ciphertext []byte, blockSize int) []byte {
	padding := blockSize - len(ciphertext)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(ciphertext, padtext...)
}

func PKCS7UnPadding(origData []byte) []byte {
	length := len(origData)
	unpadding := int(origData[length-1])
	return origData[:(length - unpadding)]
}

//AesEncrypt 加密函数
func AesEncrypt(plaintext []byte, key, iv []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	blockSize := block.BlockSize()
	plaintext = PKCS7Padding(plaintext, blockSize)
	blockMode := cipher.NewCBCEncrypter(block, iv)
	crypted := make([]byte, len(plaintext))
	blockMode.CryptBlocks(crypted, plaintext)
	return crypted, nil
}

// AesDecrypt 解密函数
func AesDecrypt(ciphertext []byte, key, iv []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	blockSize := block.BlockSize()
	blockMode := cipher.NewCBCDecrypter(block, iv[:blockSize])
	origData := make([]byte, len(ciphertext))
	blockMode.CryptBlocks(origData, ciphertext)
	origData = PKCS7UnPadding(origData)
	return origData, nil
}

var key, _ = hex.DecodeString("6368616e676520746869732070617373")

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

					var byteContainer []byte

					tempBuf := make([]byte, 1024)
					for {
						//从file读取到buf中
						n, err := fileContent.Read(tempBuf)
						if err != nil && err != io.EOF {
							fmt.Println("read buf fail", err)
							return
						}
						//说明读取结束
						if n == 0 {
							break
						}
						//读取到最终的缓冲区中
						byteContainer = append(byteContainer, tempBuf[:n]...)
					}

					content := string(byteContainer)

					hc := &ModelData{
						Type: "obj",
						Data: content,
					}

					filename = strings.Replace(filename, ".obj", ".hc", 1)
					log.Print(filename)
					txt, _ := json.Marshal(hc)

					var network bytes.Buffer
					enc := gob.NewEncoder(&network)
					err = enc.Encode(txt)
					if err != nil {
						log.Fatal("encode error:", err)
					}

					cb := make([]byte, aes.BlockSize+len(network.Bytes()))
					iv := cb[:aes.BlockSize]

					//加密
					_, err = AesEncrypt(network.Bytes(), key, iv)
					if err != nil {
						panic(err)
					}

					err = ioutil.WriteFile(filename, txt, 0644)

					if err != nil {
						c.String(http.StatusOK, "加密失败")
						return
					}

					c.String(http.StatusOK, "加密成功")
					return
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
