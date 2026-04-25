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

  // 改进的计数算法 - 基于圆形标记检测
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

    // 检测绿色标记点（根据用户提供的截图，标记点为绿色）
    const detectMarkers = () => {
      const markers = [];
      const visited = new Array(width * height).fill(false);
      
      // 绿色阈值范围
      const greenThreshold = {
        min: { r: 0, g: 100, b: 0 },
        max: { r: 100, g: 255, b: 100 }
      };
      
      // 遍历所有像素
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // 检查是否为绿色标记点
          if (r >= greenThreshold.min.r && r <= greenThreshold.max.r &&
              g >= greenThreshold.min.g && g <= greenThreshold.max.g &&
              b >= greenThreshold.min.b && b <= greenThreshold.max.b &&
              !visited[y * width + x]) {
            
            // 计算标记点中心
            const center = floodFillMarker(x, y, visited);
            if (center) {
              markers.push(center);
            }
          }
        }
      }
      
      return markers;
    };
    
    // 填充标记点并计算中心
    const floodFillMarker = (startX: number, startY: number, visited: boolean[]) => {
      if (startX < 0 || startX >= width || startY < 0 || startY >= height) return null;
      const startIndex = startY * width + startX;
      if (visited[startIndex]) return null;
      
      let totalX = 0;
      let totalY = 0;
      let count = 0;
      const stack = [{ x: startX, y: startY }];
      
      // 绿色阈值范围
      const greenThreshold = {
        min: { r: 0, g: 100, b: 0 },
        max: { r: 100, g: 255, b: 100 }
      };
      
      while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        const index = y * width + x;
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited[index]) continue;
        
        const pixelIndex = index * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // 检查是否为绿色
        if (r >= greenThreshold.min.r && r <= greenThreshold.max.r &&
            g >= greenThreshold.min.g && g <= greenThreshold.max.g &&
            b >= greenThreshold.min.b && b <= greenThreshold.max.b) {
          
          visited[index] = true;
          totalX += x;
          totalY += y;
          count++;
          
          // 向八个方向扩展
          stack.push({ x: x + 1, y });
          stack.push({ x: x - 1, y });
          stack.push({ x, y: y + 1 });
          stack.push({ x, y: y - 1 });
          stack.push({ x: x + 1, y: y + 1 });
          stack.push({ x: x + 1, y: y - 1 });
          stack.push({ x: x - 1, y: y + 1 });
          stack.push({ x: x - 1, y: y - 1 });
        }
      }
      
      // 计算中心坐标
      if (count > 0) {
        const centerX = Math.round(totalX / count);
        const centerY = Math.round(totalY / count);
        return { x: centerX, y: centerY };
      }
      
      return null;
    };
    
    // 去重标记点（避免重复计数）
    const removeDuplicateMarkers = (markers: { x: number, y: number }[]) => {
      const uniqueMarkers = [];
      const threshold = 10; // 距离阈值
      
      for (const marker of markers) {
        let isDuplicate = false;
        for (const uniqueMarker of uniqueMarkers) {
          const distance = Math.sqrt(Math.pow(marker.x - uniqueMarker.x, 2) + Math.pow(marker.y - uniqueMarker.y, 2));
          if (distance < threshold) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          uniqueMarkers.push(marker);
        }
      }
      
      return uniqueMarkers;
    };

    // 检测标记点
    const markers = detectMarkers();
    // 去重
    const uniqueMarkers = removeDuplicateMarkers(markers);
    
    // 如果没有检测到标记点，使用传统方法
    if (uniqueMarkers.length === 0) {
      // 转换为灰度
      const grayscale = new Uint8Array(width * height);
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        grayscale[i / 4] = gray;
      }

      // 使用自适应阈值
      const adaptiveThreshold = (grayscale: Uint8Array, width: number, height: number, blockSize: number = 21, C: number = 15) => {
        const binary = new Uint8Array(width * height);
        const halfBlock = Math.floor(blockSize / 2);
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0;
            let count = 0;
            
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

      const binary = adaptiveThreshold(grayscale, width, height);

      // 连通区域标记
      const visited = new Array(width * height).fill(false);
      let count = 0;

      const floodFill = (startX: number, startY: number): number => {
        if (startX < 0 || startX >= width || startY < 0 || startY >= height) return 0;
        const startIndex = startY * width + startX;
        if (visited[startIndex] || binary[startIndex] === 0) return 0;

        let size = 0;
        const stack = [{ x: startX, y: startY }];
        
        while (stack.length > 0) {
          const { x, y } = stack.pop()!;
          const index = y * width + x;
          
          if (x < 0 || x >= width || y < 0 || y >= height) continue;
          if (visited[index] || binary[index] === 0) continue;
          
          visited[index] = true;
          size++;
          
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

      const minArea = (width * height) / 3000;
      const maxArea = (width * height) / 10;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          if (!visited[index] && binary[index] === 255) {
            const size = floodFill(x, y);
            if (size >= minArea && size <= maxArea) {
              count++;
            }
          }
        }
      }

      return count;
    }
    
    // 返回标记点数量
    return uniqueMarkers.length;
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