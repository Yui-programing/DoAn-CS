import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { AdminUser } from "../../types";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCcw,
  User,
} from "lucide-react";

const roleOptions = ["User", "Admin"];

export const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "artists" | "medias">(
    "users",
  );
  const [artistRegs, setArtistRegs] = useState<any[]>([]);
  const [pendingMedias, setPendingMedias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setErrorMessage(
          response.message || "Không tải được danh sách người dùng.",
        );
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Lỗi khi kết nối server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadArtistRegs = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingArtistRegistrations();
      if (res.success) setArtistRegs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingMedias = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingMedias();
      if (res.success) setPendingMedias(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setSavingUserId(userId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await adminService.updateUserRole(userId, role);
      if (response.success) {
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role } : user)),
        );
        setSuccessMessage("Cập nhật vai trò người dùng thành công.");
      } else {
        setErrorMessage(response.message || "Không thay đổi được role.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Lỗi khi cập nhật role.",
      );
    } finally {
      setSavingUserId(null);
    }
  };

  const handleActiveChange = async (userId: string, isActive: boolean) => {
    setSavingUserId(userId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await adminService.setUserActiveState(userId, isActive);
      if (response.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isActive } : user,
          ),
        );
        setSuccessMessage("Cập nhật trạng thái người dùng thành công.");
      } else {
        setErrorMessage(response.message || "Không thay đổi được trạng thái.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái.",
      );
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs text-zinc-500 uppercase font-bold tracking-[0.35em] mb-1">
            Quản trị hệ thống
          </div>
          <h1 className="text-3xl font-black text-slate-100">
            Bảng điều khiển Admin
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400 mt-2">
            Quản lý người dùng, cấp quyền và trạng thái hoạt động. Giao diện
            đồng bộ với phong cách TuneVault hiện tại.
          </p>
        </div>

        <button
          onClick={() => void loadUsers()}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-slate-100 hover:border-green-400 hover:text-green-400 transition-all"
        >
          <RefreshCcw className="w-4 h-4" /> Làm mới dữ liệu
        </button>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="inline-block w-4 h-4 mr-2" />{" "}
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <XCircle className="inline-block w-4 h-4 mr-2" /> {errorMessage}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-900 bg-zinc-950 p-4 shadow-xl shadow-black/20">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab("users");
              void loadUsers();
            }}
            className={`px-3 py-2 rounded ${activeTab === "users" ? "bg-green-500 text-black font-bold" : "bg-zinc-900 text-zinc-300"}`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveTab("artists");
              void loadArtistRegs();
            }}
            className={`px-3 py-2 rounded ${activeTab === "artists" ? "bg-green-500 text-black font-bold" : "bg-zinc-900 text-zinc-300"}`}
          >
            Artist Registrations
          </button>
          <button
            onClick={() => {
              setActiveTab("medias");
              void loadPendingMedias();
            }}
            className={`px-3 py-2 rounded ${activeTab === "medias" ? "bg-green-500 text-black font-bold" : "bg-zinc-900 text-zinc-300"}`}
          >
            Pending Medias
          </button>
        </div>

        {activeTab === "artists" && (
          <div>
            {isLoading ? (
              <div className="p-6 text-zinc-500">Đang tải...</div>
            ) : (
              <div className="space-y-3">
                {artistRegs.length === 0 && (
                  <div className="p-4 text-zinc-500">
                    Không có yêu cầu đăng ký mới.
                  </div>
                )}
                {artistRegs.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-zinc-900 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-100">
                        {r.stageName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        User: {r.userId} • Genres: {r.genres}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const response =
                            await adminService.approveArtistRegistration(r.id);
                          if (!response.success) {
                            alert(response.message || "Phê duyệt thất bại.");
                            return;
                          }
                          void loadArtistRegs();
                        }}
                        className="px-3 py-2 bg-green-600 rounded"
                      >
                        Phê duyệt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "medias" && (
          <div>
            {isLoading ? (
              <div className="p-6 text-zinc-500">Đang tải...</div>
            ) : (
              <div className="space-y-3">
                {pendingMedias.length === 0 && (
                  <div className="p-4 text-zinc-500">
                    Không có media chờ duyệt.
                  </div>
                )}
                {pendingMedias.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-zinc-900 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-100">{m.title}</div>
                      <div className="text-xs text-zinc-500">
                        Owner: {m.ownerId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await adminService.approveMedia(m.id);
                          void loadPendingMedias();
                        }}
                        className="px-3 py-2 bg-green-600 rounded"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={async () => {
                          await adminService.rejectMedia(m.id);
                          void loadPendingMedias();
                        }}
                        className="px-3 py-2 bg-red-600 rounded"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {isLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-green-500" />
            Đang tải danh sách người dùng...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500 px-3 py-3 border-b border-zinc-900">
              <span>Người dùng</span>
              <span>Email</span>
              <span>Role</span>
              <span>Trạng thái</span>
              <span>Ngày tạo</span>
            </div>

            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3 items-center rounded-3xl bg-zinc-900/60 px-3 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-800">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">
                      {user.fullName || "Người dùng"}
                    </p>
                    <p className="text-xs text-zinc-500">{user.id}</p>
                  </div>
                </div>

                <div className="text-sm text-zinc-400 truncate">
                  {user.email}
                </div>

                <div className="space-y-2">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      void handleRoleChange(user.id, e.target.value)
                    }
                    disabled={savingUserId === user.id}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-slate-100 focus:border-green-500 focus:outline-none"
                  >
                    {roleOptions.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                  {savingUserId === user.id && (
                    <p className="text-[11px] text-zinc-500">
                      Đang cập nhật...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      void handleActiveChange(user.id, !user.isActive)
                    }
                    disabled={savingUserId === user.id}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${user.isActive ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20"}`}
                  >
                    {user.isActive ? "Hoạt động" : "Bị khoá"}
                  </button>
                </div>

                <div className="text-xs text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
