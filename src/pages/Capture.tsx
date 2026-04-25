import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChevronLeft } from 'lucide-react';

export default function Capture() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = location.state || { type: 'steel-pipe' };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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

  useEffect(() => {
    // 启动相机
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
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

    // 模拟识别过程
    setTimeout(() => {
      // 将画布转换为图片数据
      const imageData = canvas.toDataURL('image/jpeg');
      
      // 模拟计数结果（实际应用中这里会调用识别算法）
      const count = Math.floor(Math.random() * 50) + 10; // 生成10-60之间的随机数
      
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* 拍照按钮 */}
      <div className="py-8 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg ${isCapturing ? 'opacity-50' : 'hover:scale-105 transition-transform'}`}
        >
          <Camera size={32} className="text-blue-600" />
        </button>
      </div>
    </div>
  );
}