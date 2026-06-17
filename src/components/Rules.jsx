import React from 'react';
import { Shield, Coins, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Rules({ finishedCount, totalCount }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Overview stats and fund banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            🏆
          </div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
            Số trận đã đấu
          </span>
          <h2 className="text-2xl font-bold mt-2 text-cyan-400 glow-text-blue">
            {finishedCount} / {totalCount}
          </h2>
          <p className="text-[11px] text-gray-500 mt-2">
            Tiến trình giải đấu World Cup 2026
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            👥
          </div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
            Thành viên nhóm
          </span>
          <h2 className="text-2xl font-bold mt-2 text-amber-400">
            ~ 22-23 Người
          </h2>
          <p className="text-[11px] text-gray-500 mt-2">
            Tham gia bình chọn trận đấu mỗi ngày
          </p>
        </div>
      </div>

      {/* World Cup 2026 Tournament Smart Facts */}
      <div className="glass-panel p-6 border-cyan-500/10 bg-cyan-950/5">
        <h3 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
          ⚽ Thông Tin Giải Đấu World Cup 2026 <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">Hosts: 🇨🇦 🇺🇸 🇲🇽</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Quy mô mở rộng</span>
            <div className="text-sm font-bold text-gray-100">48 Đội tuyển</div>
            <p className="text-[10px] text-gray-500">12 Bảng đấu, 104 Trận đấu sôi động</p>
          </div>
          <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Thời gian</span>
            <div className="text-sm font-bold text-gray-100">12/06 — 19/07/2026</div>
            <p className="text-[10px] text-gray-500">Mùa hè bóng đá rực lửa tại Bắc Mỹ</p>
          </div>
          <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Khai mạc</span>
            <div className="text-sm font-bold text-gray-100">Estadio Azteca 🇲🇽</div>
            <p className="text-[10px] text-gray-500">Mexico City - Sân huyền thoại 3 lần đăng cai</p>
          </div>
          <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Chung kết</span>
            <div className="text-sm font-bold text-gray-100">MetLife Stadium 🇺🇸</div>
            <p className="text-[10px] text-gray-500">New York/New Jersey - Sức chứa 82.500 chỗ</p>
          </div>
        </div>
      </div>

      {/* Rules breakdown card */}
      <div className="glass-panel p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold text-gray-100">Luật Chơi & Cách Tính Kết Quả</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rule 1 */}
            <div className="flex gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400 mb-1">Dự đoán ĐÚNG kết quả (Điểm: 0)</h3>
                <p className="text-sm text-gray-300">
                  Dự đoán đúng đội thắng, đội thua hoặc kết quả hòa nhưng sai tỷ số cụ thể. 
                  Ghi nhận trạng thái: <strong>Đoán đúng</strong>. Không cộng/trừ điểm.
                </p>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Ví dụ: Dự đoán 1-0, kết quả thực tế là 2-1 (Chủ nhà thắng)
                </span>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                ✗
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Dự đoán SAI kết quả (Điểm: -100)</h3>
                <p className="text-sm text-gray-300">
                  Dự đoán sai đội thắng/thua hoặc hòa. 
                  Ghi nhận trạng thái: <strong>Đoán sai</strong>. Bị trừ 100 điểm.
                </p>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Ví dụ: Dự đoán 1-1, kết quả thực tế là 2-1 (Chủ nhà thắng)
                </span>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                ★
              </div>
              <div>
                <h3 className="font-semibold text-amber-400 mb-1">Dự đoán ĐÚNG CẢ TỶ SỐ (Điểm: +100)</h3>
                <p className="text-sm text-gray-300">
                  Dự đoán chính xác tuyệt đối tỷ số trận đấu. 
                  Ghi nhận trạng thái: <strong>Đoán đúng (Trúng tỷ số)</strong>. Được cộng 100 điểm.
                </p>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Ví dụ: Dự đoán 2-1, kết quả thực tế là 2-1
                </span>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 border-dashed">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                ⏰
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Không bình chọn / Quá hạn (Điểm: -100)</h3>
                <p className="text-sm text-gray-300">
                  Trận đấu đã lăn bóng mà bạn chưa gửi bình chọn. 
                  Ghi nhận trạng thái: <strong>Không dự đoán</strong> (Coi như đoán sai). Bị trừ 100 điểm.
                </p>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Bình chọn sẽ tự động khóa đúng vào giờ kickoff của trận đấu!
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
