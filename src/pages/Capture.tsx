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
  }, [stream]);

  // 拍照处理
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // 跳转到标记编辑页面
      navigate('/edit', { state: { image: imageUrl, type: type } });
    }
    setIsCapturing(false);
  };

  // 文件上传处理
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // 跳转到标记编辑页面
          navigate('/edit', { state: { image: event.target.result as string, type: type } });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between p-4 text-white bg-black">
        <button onClick={() => navigate('/')} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-medium">{typeNames[type] || '拍照'}</h1>
        <div className="w-10" />
      </div>

      {/* 相机预览 */}
      <div className="flex-1 relative">
        {cameraError ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <p>{cameraError}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 底部控制 */}
      <div className="p-6 pb-10 bg-black flex items-center justify-around">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center text-white"
        >
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
            <Upload size={24} />
          </div>
          <span className="text-sm">相册</span>
        </button>

        <button
          onClick={handleCapture}
          disabled={isCapturing || !!cameraError}
          className="flex flex-col items-center text-white"
        >
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <Camera size={32} />
          </div>
          <span className="text-sm mt-1">拍照</span>
        </button>

        <div className="w-16" />
      </div>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
    </div>
  );
}
