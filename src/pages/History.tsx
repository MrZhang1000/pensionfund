import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCountStore, type CountRecord } from '../store/countStore';

export default function History() {
  const navigate = useNavigate();
  const { records, deleteRecord } = useCountStore();

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const handleRecordClick = (record: CountRecord) => {
    navigate(`/edit/${record.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center p-4 bg-white shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 mr-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">历史记录</h1>
      </div>

      <div className="p-4">
        {records.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                onClick={() => handleRecordClick(record)}
              >
                <div className="flex">
                  <div className="w-32 h-32">
                    <img
                      src={record.image}
                      alt="计数图片"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {record.count} 粒
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {objectTypeNames[record.objectType] || record.objectType}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, record.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
