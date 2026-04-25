import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Check } from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, type, image } = location.state || { count: 0, type: 'steel-pipe', image: '' };

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

  const handleBack = () => {
    navigate('/capture', { state: { type } });
  };

  const handleConfirm = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center">
        <button onClick={handleBack} className="p-2">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">计数结果</h1>
        <div className="w-8"></div> {/* 占位，保持标题居中 */}
      </div>

      {/* 拍摄的图片 */}
      <div className="p-4">
        {image && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={image} alt="拍摄结果" className="w-full h-64 object-cover" />
          </div>
        )}
      </div>

      {/* 计数结果 */}
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <h2 className="text-lg text-gray-600 mb-2">{typeNames[type] || '物体'}数量</h2>
        <div className="text-6xl font-bold text-blue-600 mb-4">{count}</div>
        <p className="text-sm text-gray-500">识别结果仅供参考，实际数量以人工计数为准</p>
      </div>

      {/* 操作按钮 */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-800 py-4 rounded-lg flex items-center justify-center shadow-sm"
        >
          <Camera size={20} className="mr-2" />
          重新拍照
        </button>
        <button
          onClick={handleConfirm}
          className="bg-blue-600 text-white py-4 rounded-lg flex items-center justify-center shadow-sm"
        >
          <Check size={20} className="mr-2" />
          确认结果
        </button>
      </div>
    </div>
  );
}