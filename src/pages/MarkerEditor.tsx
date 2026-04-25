import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Undo2 } from 'lucide-react';
import { useCountStore, type Marker, type CountRecord } from '../store/countStore';

export default function MarkerEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const {
    currentImage, currentMarkers, addMarker, removeMarker, clearMarkers, addRecord, updateRecord, records, setCurrentImage } = useCountStore();
  const [markerColor, setMarkerColor] = useState<'green' | 'red'>('green');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    clearMarkers(); // 先清除旧的标记
    if (id) {
      const record = records.find((r) => r.id === id);
      if (record) {
        setCurrentImage(record.image);
      }
    } else if (location.state?.image) {
      setCurrentImage(location.state.image);
    }
  }, [id, records, setCurrentImage, clearMarkers]);

  const objectTypeNames: Record<string, string> = {
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

  // 单独的useEffect来加载历史记录的标记
  useEffect(() => {
    if (id && imageLoaded) {
      const record = records.find((r) => r.id === id);
      if (record) {
        record.markers.forEach((marker) => addMarker(marker));
      }
    }
  }, [id, records, imageLoaded, addMarker]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current || !imageLoaded) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const img = imageRef.current;
    
    // 计算点击在原图上的坐标
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // 计算缩放比例
    const scaleX = img.width / imageSize.width;
    const scaleY = img.height / imageSize.height;
    
    const realX = clickX / scaleX;
    const realY = clickY / scaleY;

    // 首先检查是否点击了已有的标记，如果是则删除
    let markerRemoved = false;
    for (const marker of currentMarkers) {
      // 计算标记在屏幕上的位置
      const markerScreenX = (marker.x / imageSize.width) * img.width;
      const markerScreenY = (marker.y / imageSize.height) * img.height;
      
      const distance = Math.sqrt(
        Math.pow(clickX - markerScreenX, 2) + Math.pow(clickY - markerScreenY, 2)
      );
      
      if (distance < 24) { // 标记半径
        removeMarker(marker.id);
        markerRemoved = true;
        break;
      }
    }
    
    // 如果没有删除标记，则添加新标记
    if (!markerRemoved) {
      addMarker({
        id: Date.now().toString(),
        x: realX,
        y: realY,
        color: markerColor,
      });
    }
  };

  const handleUndo = () => {
    if (currentMarkers.length > 0) {
      removeMarker(currentMarkers[currentMarkers.length - 1].id);
    }
  };

  const handleSave = () => {
    if (!currentImage) return;

    const recordData: CountRecord = {
      id: id || Date.now().toString(),
      image: currentImage,
      count: currentMarkers.length,
      markers: [...currentMarkers],
      objectType: location.state?.type || 'steel-pipe',
      createdAt: Date.now(),
    };

    if (id) {
      updateRecord(id, recordData);
    } else {
      addRecord(recordData);
    }

    clearMarkers();
    navigate('/');
  };

  // 渲染标记
  const renderMarkers = () => {
    if (!containerRef.current || !imageRef.current || !imageLoaded) return null;
    
    const img = imageRef.current;
    
    return currentMarkers.map((marker) => {
      // 计算标记在屏幕上的位置
      const screenX = (marker.x / imageSize.width) * img.width;
      const screenY = (marker.y / imageSize.height) * img.height;

      return (
        <div
          key={marker.id}
          onClick={(e) => {
            e.stopPropagation();
            removeMarker(marker.id);
          }}
          style={{
            position: 'absolute',
            left: screenX - 12,
            top: screenY - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: marker.color === 'green' ? '#00ff00' : '#ff0000',
            border: '2px solid white',
            boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 10,
          }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white bg-black">
        <button onClick={() => navigate('/')} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <div className="text-xl font-bold">
          {currentMarkers.length} 粒
        </div>
        <div className="w-10" />
      </div>

      <div className="flex items-center justify-center space-x-4 py-2 bg-gray-800">
        <button
          onClick={() => setMarkerColor('green')}
          className={`px-4 py-2 rounded-full ${
            markerColor === 'green' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          绿色标记
        </button>
        <button
          onClick={() => setMarkerColor('red')}
          className={`px-4 py-2 rounded-full ${
            markerColor === 'red' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          红色标记
        </button>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900" 
        ref={containerRef}
        onClick={handleClick}
        style={{ cursor: 'crosshair' }}
      >
        {currentImage && (
          <img
            ref={imageRef}
            src={currentImage}
            alt="计数图片"
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
          />
        )}
        {renderMarkers()}
      </div>

      <div className="flex items-center justify-around py-4 bg-gray-900">
        <button
          onClick={handleUndo}
          disabled={currentMarkers.length === 0}
          className="flex items-center space-x-2 text-white px-4 py-2 rounded-full bg-gray-700 disabled:opacity-50"
        >
          <Undo2 size={20} />
          <span>撤销</span>
        </button>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-full"
        >
          <Check size={20} />
          <span>完成</span>
        </button>
      </div>
    </div>
  );
}
