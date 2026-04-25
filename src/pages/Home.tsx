import { useState } from 'react';
import { Camera, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 物体类型数据
const objectTypes = [
  { id: 'bamboo', name: '竹签', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bamboo%20sticks%20close%20up&image_size=square' },
  { id: 'log', name: '圆木', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=round%20wooden%20logs&image_size=square' },
  { id: 'square-wood', name: '方木', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=square%20wooden%20beams&image_size=square' },
  { id: 'fabric-roll', name: '布料卷', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fabric%20rolls&image_size=square' },
  { id: 'disk-rod', name: '盘扣横杆', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scaffolding%20crossbar&image_size=square' },
  { id: 'disk-vertical', name: '盘扣立杆', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scaffolding%20vertical%20pole&image_size=square' },
  { id: 'disk-diagonal', name: '盘扣斜杆', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scaffolding%20diagonal%20pole&image_size=square' },
  { id: 'quick-release', name: '快拆架', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quick%20release%20scaffolding&image_size=square' },
  { id: 'wheel-rod', name: '轮扣横杆', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wheel%20lock%20scaffolding%20crossbar&image_size=square' },
  { id: 'square-tube', name: '方管', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=square%20metal%20tube&image_size=square' },
  { id: 'square-column', name: '方柱扣', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=square%20column%20clamp&image_size=square' },
  { id: 'pvc-tube', name: 'PVC管', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=PVC%20pipes&image_size=square' },
  { id: 'oval-tube', name: '椭圆管', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=oval%20metal%20tube&image_size=square' },
  { id: 'pipe-pile', name: '管桩', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pipe%20pile&image_size=square' },
  { id: 'person', name: '人', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=people%20counting&image_size=square' },
  { id: 'screw', name: '螺丝', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=screws%20close%20up&image_size=square' },
  { id: 'button', name: '纽扣', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=buttons%20close%20up&image_size=square' },
  { id: 'battery', name: '干电池', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AA%20batteries&image_size=square' },
  { id: 'coin', name: '硬币', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coins%20close%20up&image_size=square' },
  { id: 'broad-bean', name: '蚕豆', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broad%20beans&image_size=square' },
  { id: 'egg', name: '鸡蛋', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=eggs%20in%20carton&image_size=square' },
  { id: 'pearl', name: '珍珠', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pearls%20close%20up&image_size=square' },
  { id: 'cotton-swab', name: '棉签', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cotton%20swabs&image_size=square' },
  { id: 'corn', name: '玉米粒', icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corn%20kernels&image_size=square' },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('steel-pipe');

  const handleCapture = (type: string) => {
    navigate('/capture', { state: { type } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">数钢管</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-blue-700 px-2 py-1 rounded">精准点数</span>
          <button className="p-2">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* 广告横幅 */}
      <div className="bg-blue-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold">安建脚手架(辽宁)有限公司</h2>
            <p className="text-xs mt-1">主营: 国标盘扣、钢管、双托梁、方柱扣、架具、跳板及各种脚手架材质租赁和分包业务。</p>
            <p className="text-xs mt-1">📞 13284110666</p>
          </div>
          <div className="flex items-center">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scaffolding%20equipment&image_size=landscape_4_3" 
              alt="脚手架" 
              className="w-20 h-20 object-cover rounded"
            />
            <button className="ml-2 flex items-center text-xs">
              点击查看 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 主要功能区 */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <button 
          onClick={() => handleCapture('steel-pipe')}
          className="bg-blue-600 text-white p-6 rounded-lg flex flex-col items-center justify-center shadow-md"
        >
          <Camera size={24} className="mb-2" />
          <span>拍照数钢管</span>
        </button>
        <button 
          onClick={() => handleCapture('steel-bar')}
          className="bg-blue-600 text-white p-6 rounded-lg flex flex-col items-center justify-center shadow-md"
        >
          <Camera size={24} className="mb-2" />
          <span>拍照数钢筋</span>
        </button>
      </div>

      {/* 功能分类 */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {objectTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleCapture(type.id)}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white p-2 shadow-md mb-2 overflow-hidden">
                <img src={type.icon} alt={type.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-center">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部导航 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
        <button className="flex flex-col items-center text-blue-600">
          <Camera size={20} />
          <span className="text-xs mt-1">首页</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <span className="text-xs mt-1">我的</span>
        </button>
      </footer>
    </div>
  );
}