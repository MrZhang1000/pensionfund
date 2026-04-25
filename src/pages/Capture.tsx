import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChevronLeft, Upload } from 'lucide-react';

export default function Capture() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = location.state || { type: 'steel-pipe' };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 物体类型名称映射
  const typeNames: Record<string, string> = {
    'steel-pipe': '钢管',
    'steel-bar': '钢筋',
    'bamboo': '竹签',
    'log': '圆木',
    'square-wood': '方木',
    'fabric-roll': '布料卷',
    'disk-rod': '盘扣横杆',
    'disk-vertical': '盘扣立杆',
    'disk-diagonal': '盘扣斜杆',
    'quick-release': '快拆架',
    'wheel-rod': '轮扣横杆',
    'square-tube': '方管',
    'square-column': '方柱扣',
    'pvc-tube': 'PVC管',
    'oval-tube': '椭圆管',
    'pipe-pile': '管桩',
    'person': '人',
    'screw': '螺丝',
    'button': '纽扣',
    'battery': '干电池',
    'coin': '硬币',
    'broad-bean': '蚕豆',
    'egg': '鸡蛋',
    'pearl': '珍珠',
    'cotton-swab': '棉签',
    'corn': '玉米粒',
  };

  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // 启动相机
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setCameraError(null);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setCameraError('无法访问相机，请检查权限设置');
      }
    };

    startCamera();

    // 清理函数
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 改进的计数算法
  const countObjects = (canvas: HTMLCanvasElement) => {
    let ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // 调整画布大小，提高处理速度
    const maxSize = 800;
    let newWidth = canvas.width;
    let newHeight = canvas.height;
    
    if (newWidth > maxSize || newHeight > maxSize) {
      const scale = maxSize / Math.max(newWidth, newHeight);
      newWidth = Math.floor(newWidth * scale);
      newHeight = Math.floor(newHeight * scale);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        canvas = tempCanvas;
        ctx = tempCtx;
      }
    }

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // 转换为灰度
    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      grayscale[i / 4] = gray;
    }

    // 使用自适应阈值（局部阈值）
    const adaptiveThreshold = (grayscale: Uint8Array, width: number, height: number, blockSize: number = 15, C: number = 10) => {
      const binary = new Uint8Array(width * height);
      const halfBlock = Math.floor(blockSize / 2);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sum = 0;
          let count = 0;
          
          // 计算局部区域的平均亮度
          for (let ky = -halfBlock; ky <= halfBlock; ky++) {
            for (let kx = -halfBlock; kx <= halfBlock; kx++) {
              const nx = x + kx;
              const ny = y + ky;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                sum += grayscale[ny * width + nx];
                count++;
              }
            }
          }
          
          const threshold = (sum / count) - C;
          const index = y * width + x;
          binary[index] = grayscale[index] < threshold ? 255 : 0;
        }
      }
      
      return binary;
    };

    // 使用自适应阈值
    const binary = adaptiveThreshold(grayscale, width, height);

    // 形态学操作：腐蚀和膨胀
    const applyMorphology = (binary: Uint8Array, width: number, height: number, operation: 'erode' | 'dilate') => {
      const result = new Uint8Array(binary.length);
      const kernel = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ];
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let min = 255;
          let max = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              if (kernel[ky + 1][kx + 1] === 1) {
                const nx = x + kx;
                const ny = y + ky;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const value = binary[ny * width + nx];
                  min = Math.min(min, value);
                  max = Math.max(max, value);
                }
              }
            }
          }
          
          result[y * width + x] = operation === 'erode' ? min : max;
        }
      }
      
      return result;
    };

    // 应用形态学操作：先腐蚀后膨胀，分离粘连物体
    const eroded = applyMorphology(binary, width, height, 'erode');
    const dilated = applyMorphology(eroded, width, height, 'dilate');

    // 连通区域标记并过滤大小
    const visited = new Array(width * height).fill(false);
    let count = 0;

    // 迭代实现的floodFill函数，避免栈溢出
    const floodFill = (startX: number, startY: number): number => {
      if (startX < 0 || startX >= width || startY < 0 || startY >= height) return 0;
      const startIndex = startY * width + startX;
      if (visited[startIndex] || dilated[startIndex] === 0) return 0;

      let size = 0;
      const stack = [{ x: startX, y: startY }];
      
      while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        const index = y * width + x;
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited[index] || dilated[index] === 0) continue;
        
        visited[index] = true;
        size++;
        
        // 向八个方向扩展，提高连通性
        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
        stack.push({ x: x + 1, y: y + 1 });
        stack.push({ x: x + 1, y: y - 1 });
        stack.push({ x: x - 1, y: y + 1 });
        stack.push({ x: x - 1, y: y - 1 });
      }
      
      return size;
    };

    // 计算最小和最大像素面积（根据图像大小调整）
    const minArea = (width * height) / 8000; // 进一步减小最小面积阈值
    const maxArea = (width * height) / 3; // 进一步增大最大面积阈值

    // 遍历所有像素
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (!visited[index] && dilated[index] === 255) {
          const size = floodFill(x, y);
          if (size >= minArea && size <= maxArea) {
            count++;
          }
        }
      }
    }

    return count;
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    // 绘制视频帧到画布
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // 执行实际计数
    setTimeout(() => {
      // 计算物体数量
      const count = countObjects(canvas);
      
      // 将画布转换为图片数据
      const imageData = canvas.toDataURL('image/jpeg');
      
      // 跳转到结果页面
      navigate('/result', { 
        state: { 
          count, 
          type, 
          image: imageData 
        } 
      });
    }, 1000);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      if (!imageData) {
        console.error('Failed to read file');
        setIsCapturing(false);
        return;
      }
      
      // 创建一个临时画布来处理图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        setIsCapturing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // 设置画布大小
          canvas.width = img.width;
          canvas.height = img.height;
          
          // 绘制图片到画布
          ctx.drawImage(img, 0, 0);
          
          // 执行实际计数
          const count = countObjects(canvas);
          console.log('Count result:', count);
          
          // 跳转到结果页面
          navigate('/result', { 
            state: { 
              count, 
              type, 
              image: imageData 
            } 
          });
        } catch (error) {
          console.error('Error processing image:', error);
          setIsCapturing(false);
        }
      };
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        setIsCapturing(false);
      };
      img.src = imageData;
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 text-white">
        <button onClick={handleBack} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <div className="bg-white bg-opacity-20 px-4 py-1 rounded-full">
          <span>{typeNames[type] || '物体'}</span>
        </div>
        <div className="w-8"></div> {/* 占位，保持标题居中 */}
      </div>

      {/* 相机预览 */}
      {cameraError ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center text-white p-4">
          <p className="text-center mb-4">{cameraError}</p>
          <p className="text-center text-sm">您仍然可以通过上传照片来进行计数</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="flex-1 w-full object-cover"
        />
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* 拍照和上传按钮 */}
      <div className="py-8 flex justify-center space-x-8">
        <button
          onClick={handleUploadClick}
          disabled={isCapturing}
          className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg ${isCapturing ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
        >
          <Upload size={24} className="text-blue-600" />
        </button>
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg ${isCapturing ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
        >
          <Camera size={32} className="text-blue-600" />
        </button>
      </div>
      
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}