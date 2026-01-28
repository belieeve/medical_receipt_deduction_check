import React, { useState, useEffect } from 'react';
import { X, Save, HelpCircle, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    gasUrl: string;
    onSave: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, gasUrl, onSave }) => {
    const [url, setUrl] = useState(gasUrl);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        setUrl(gasUrl);
    }, [gasUrl]);

    const handleSave = () => {
        onSave(url);
        onClose();
    };

    const copyCode = () => {
        const code = `
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // ヘッダー行がない場合は追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["日付", "金額", "内容", "ファイル名", "ID", "画像URL"]);
    }

    // 画像の保存処理
    var fileUrl = "";
    if (data.image) {
       var folderName = "医療費領収証"; 
       var folders = DriveApp.getFoldersByName(folderName);
       var folder;
       if (folders.hasNext()) { folder = folders.next(); } 
       else { folder = DriveApp.createFolder(folderName); }
       
       var blob = Utilities.newBlob(Utilities.base64Decode(data.image), data.mimeType, data.fileName);
       var file = folder.createFile(blob);
       file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
       fileUrl = file.getUrl();
    }
    
    // データを追加
    sheet.appendRow([
      data.date,
      data.amount,
      data.text,
      data.fileName,
      data.id,
      fileUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
    `.trim();
        navigator.clipboard.writeText(code);
        alert('コードをコピーしました！');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <SettingsIcon className="w-5 h-5 text-primary" />
                                スプレッドシート連携設定
                            </h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    GAS Web App URL
                                </label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://script.google.com/macros/s/..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                                <p className="text-xs text-slate-500">
                                    発行された「ウェブアプリのURL」をここに貼り付けてください。
                                </p>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <button
                                    onClick={() => setShowHelp(!showHelp)}
                                    className="flex items-center justify-between w-full text-left text-sm font-semibold text-primary hover:text-primary-glow transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4" />
                                        設定方法を見る（初めての方はこちら）
                                    </span>
                                    <span>{showHelp ? '閉じる' : '開く'}</span>
                                </button>

                                {showHelp && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-4 space-y-4 text-sm text-slate-300 overflow-hidden"
                                    >
                                        <ol className="list-decimal list-inside space-y-3 marker:text-primary">
                                            <li>
                                                <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                                                    Googleスプレッドシートを新規作成 <ExternalLink className="w-3 h-3" />
                                                </a>
                                                します。
                                            </li>
                                            <li>
                                                メニューの <strong>拡張機能 &gt; Apps Script</strong> をクリックします。
                                            </li>
                                            <li>
                                                エディタが開くので、以下のコードをコピーして貼り付けます（元のコードは消してください）。
                                                <div className="mt-2 relative">
                                                    <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-400 overflow-x-auto border border-slate-800">
                                                        {`function doPost(e) { ... }`}
                                                    </pre>
                                                    <button
                                                        onClick={copyCode}
                                                        className="absolute top-2 right-2 px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded transition-colors"
                                                    >
                                                        コードをコピー
                                                    </button>
                                                </div>
                                            </li>
                                            <li>
                                                右上の <strong>「デプロイ」 &gt; 「新しいデプロイ」</strong> をクリックします。
                                            </li>
                                            <li>
                                                「種類の選択」の歯車アイコンから <strong>「ウェブアプリ」</strong> を選択します。
                                            </li>
                                            <li>
                                                重要な設定：
                                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-400">
                                                    <li>説明: 「ReceiptApp」など適当に</li>
                                                    <li>次のユーザーとして実行: <strong>「自分」</strong></li>
                                                    <li>アクセスできるユーザー: <strong>「全員」</strong> (これ重要です！)</li>
                                                </ul>
                                            </li>
                                            <li>
                                                「デプロイ」ボタンを押し、承認画面が出たら許可します。
                                            </li>
                                            <li>
                                                表示された <strong>「ウェブアプリのURL」</strong> をコピーして、この画面の入力欄に貼り付ければ完了です！
                                            </li>
                                        </ol>
                                    </motion.div>
                                )}
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-primary hover:bg-primary-glow text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary/20"
                            >
                                保存して連携開始
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
