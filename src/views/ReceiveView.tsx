import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";

export function ReceiveView() {
  const { account } = useAuth();
  const navigate = useNavigate();

  const qrData = account ? `ecovities:${account.eco_id}` : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=146c2e&bgcolor=ffffff`;

  async function handleShare() {
    if (!account) return;
    const shareText = `Pay me on EcoVities: ${account.eco_id}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user cancelled share - no action needed
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }

  return (
    <div className="flex-col flex-1 h-full bg-surface-container relative flex">
      <div className="px-4 pt-6 pb-4 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-700 hover:bg-gray-200 rounded-full transition"
          aria-label="Close"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
        <h1 className="text-xl font-medium text-gray-900">Receive EcoPoints</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="bg-surface w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center shadow-md">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm mb-3">
            <Avatar seed={account?.full_name ?? "User"} size={64} />
          </div>
          <h2 className="text-xl font-medium text-gray-900">{account?.full_name}</h2>
          <p className="text-gray-500 text-[15px] mb-8">{account?.eco_id}</p>

          <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center p-2 mb-8 border-2 border-gray-100">
            {account && (
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-full h-full rounded-xl mix-blend-multiply"
              />
            )}
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-primary-container text-on-primary-container py-3 rounded-full text-[15px] font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-[20px]">share</span> Share QR
          </button>
        </div>
      </div>
    </div>
  );
}
