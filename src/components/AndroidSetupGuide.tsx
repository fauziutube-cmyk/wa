import React, { useState } from 'react';
import { 
  Smartphone, 
  Code, 
  Copy, 
  Check, 
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export const AndroidSetupGuide: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'native' | 'webview'>('native');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // 1. Service Kotlin (Latar Belakang - Dipakai kedua opsi)
  const serviceCode = `package com.autoreply.whatsapp

import android.app.Notification
import android.app.RemoteInput
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray

class WhatsAppAutoReplyService : NotificationListenerService() {

    data class Rule(
        val keyword: String,
        val reply: String,
        val delaySeconds: Long,
        val matchType: String = "contains"
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        val packageName = sbn?.packageName ?: return
        // Mendukung WhatsApp Resmi & WhatsApp Business
        if (packageName != "com.whatsapp" && packageName != "com.whatsapp.w4b") return

        val notification = sbn.notification ?: return
        val extras = notification.extras ?: return

        val title = extras.getString(Notification.EXTRA_TITLE) ?: "" // Nama pengirim/kontak
        val message = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: "" // Isi pesan WA masuk

        if (title.isEmpty() || message.isEmpty()) return

        // Cari aksi Balas Notifikasi (Direct Reply) bawaan Android
        val wearableExtender = Notification.WearableExtender(notification)
        val actions = notification.actions ?: wearableExtender.actions.toTypedArray()
        
        var replyAction: Notification.Action? = null
        var remoteInput: RemoteInput? = null

        for (action in actions) {
            action.remoteInputs?.forEach { input ->
                if (input.resultKey != null) {
                    replyAction = action
                    remoteInput = input
                }
            }
        }

        if (replyAction == null || remoteInput == null) return

        // Ambil daftar aturan yang tersimpan di HP
        val rules = loadSavedRules()

        // Cocokkan kata kunci
        val matchedRule = rules.firstOrNull { rule ->
            when (rule.matchType) {
                "exact" -> message.trim().equals(rule.keyword, ignoreCase = true)
                "starts_with" -> message.trim().startsWith(rule.keyword, ignoreCase = true)
                else -> message.contains(rule.keyword, ignoreCase = true)
            }
        } ?: return

        // Terapkan WAKTU TUNGGU (Delay detik) sebelum membalas otomatis
        val delayMillis = matchedRule.delaySeconds * 1000L

        Handler(Looper.getMainLooper()).postDelayed({
            try {
                val intent = Intent()
                val bundle = Bundle()
                val finalReply = matchedRule.reply
                    .replace("{nama}", title)
                    .replace("{pengirim}", title)

                bundle.putCharSequence(remoteInput.resultKey, finalReply)
                RemoteInput.addResultsToIntent(arrayOf(remoteInput), intent, bundle)

                replyAction.actionIntent.send(applicationContext, 0, intent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, delayMillis)
    }

    private fun loadSavedRules(): List<Rule> {
        val prefs = getSharedPreferences("AutoReplyPrefs", Context.MODE_PRIVATE)
        val jsonStr = prefs.getString("rules_json", null)
        val list = mutableListOf<Rule>()

        if (!jsonStr.isNullOrEmpty()) {
            try {
                val array = JSONArray(jsonStr)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        Rule(
                            keyword = obj.getString("keyword"),
                            reply = obj.getString("reply"),
                            delaySeconds = obj.optLong("delaySeconds", 5L),
                            matchType = obj.optString("matchType", "contains")
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Aturan default jika pengguna belum menambah aturan
        if (list.isEmpty()) {
            list.add(Rule("halo", "Halo kak! Terima kasih sudah menghubungi kami.", 3))
            list.add(Rule("harga", "Daftar harga produk kami mulai Rp 45.000.", 5))
            list.add(Rule("ongkir", "Kirimkan alamat kecamatan tujuan Anda ya!", 4))
        }

        return list
    }
}`;

  // Mode A: Native Android Activity
  const nativeMainActivityCode = `package com.autoreply.whatsapp

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnPermission = findViewById<Button>(R.id.btnPermission)
        val etKeyword = findViewById<EditText>(R.id.etKeyword)
        val etReply = findViewById<EditText>(R.id.etReply)
        val etDelay = findViewById<EditText>(R.id.etDelay)
        val btnSave = findViewById<Button>(R.id.btnSave)

        // Tombol aktifkan izin Akses Notifikasi
        btnPermission.setOnClickListener {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            startActivity(intent)
        }

        // Tombol simpan aturan baru
        btnSave.setOnClickListener {
            val keyword = etKeyword.text.toString().trim()
            val reply = etReply.text.toString().trim()
            val delayStr = etDelay.text.toString().trim()
            val delay = delayStr.toLongOrNull() ?: 5L

            if (keyword.isEmpty() || reply.isEmpty()) {
                Toast.makeText(this, "Kata kunci dan balasan wajib diisi!", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            saveRule(keyword, reply, delay)
            Toast.makeText(this, "Aturan '$keyword' (delay \${delay}s) tersimpan!", Toast.LENGTH_SHORT).show()
            etKeyword.text.clear()
            etReply.text.clear()
        }
    }

    private fun saveRule(keyword: String, reply: String, delay: Long) {
        val prefs = getSharedPreferences("AutoReplyPrefs", Context.MODE_PRIVATE)
        val currentJson = prefs.getString("rules_json", "[]") ?: "[]"
        val array = JSONArray(currentJson)

        val newRule = JSONObject().apply {
            put("keyword", keyword)
            put("reply", reply)
            put("delaySeconds", delay)
            put("matchType", "contains")
        }
        array.put(newRule)

        prefs.edit().putString("rules_json", array.toString()).apply()
    }
}`;

  const nativeLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="20dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="AutoReply WhatsApp"
        android:textSize="22sp"
        android:textStyle="bold"
        android:textColor="#075E54"
        android:layout_marginBottom="16dp" />

    <!-- Tombol Izin Notifikasi Wajib -->
    <Button
        android:id="@+id/btnPermission"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="1. Aktifkan Izin Akses Notifikasi"
        android:backgroundTint="#00A884"
        android:textColor="#FFFFFF"
        android:layout_marginBottom="20dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="2. Tambah Aturan Kata Kunci dan Waktu Tunggu:"
        android:textStyle="bold"
        android:layout_marginBottom="8dp" />

    <EditText
        android:id="@+id/etKeyword"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Kata kunci pemicu (contoh: harga)"
        android:layout_marginBottom="10dp" />

    <EditText
        android:id="@+id/etReply"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Pesan balasan otomatis"
        android:minLines="2"
        android:layout_marginBottom="10dp" />

    <EditText
        android:id="@+id/etDelay"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Waktu tunggu / Delay (detik, default: 5)"
        android:inputType="number"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/btnSave"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Simpan Aturan"
        android:backgroundTint="#075E54"
        android:textColor="#FFFFFF" />

</LinearLayout>`;

  // Mode B: WebView (Tampilan Lengkap Web UI Masuk ke HP)
  const webViewMainActivityCode = `package com.autoreply.whatsapp

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        // Konfigurasi agar tampilan aplikasi web berjalan 100% lancar di HP
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        webView.webViewClient = WebViewClient()

        // Memuat seluruh tampilan aplikasi ini langsung ke dalam APK HP Anda
        webView.loadUrl("https://ais-pre-n4j2gygs624unfiftcfhjd-288454459356.asia-southeast1.run.app")

        // Periksa izin notifikasi saat aplikasi dibuka
        checkNotificationPermission()
    }

    private fun checkNotificationPermission() {
        val enabledListeners = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        val packageName = packageName
        if (enabledListeners == null || !enabledListeners.contains(packageName)) {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            startActivity(intent)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}`;

  const webViewLayoutXml = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- Menampilkan keseluruhan web dashboard & simulator ke layar HP -->
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</RelativeLayout>`;

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.autoreply.whatsapp">

    <!-- Izin Internet (Diperlukan untuk memuat antarmuka WebView) -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AutoReply WA"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <!-- Activity Tampilan di Layar HP -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Layanan Background Pembaca Notifikasi WA & Delay Handler -->
        <service
            android:name=".WhatsAppAutoReplyService"
            android:label="WhatsApp Auto Reply Service"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

    </application>

</manifest>`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Cara Membangun Aplikasi APK di Android Studio</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Pilih model tampilan yang ingin Anda gunakan di HP:
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0 self-start sm:self-center border border-zinc-200">
            <button
              onClick={() => setActiveMode('webview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMode === 'webview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Model Web Lengkap (Rekomendasi)</span>
            </button>
            <button
              onClick={() => setActiveMode('native')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMode === 'native'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Model Form Ringkas</span>
            </button>
          </div>
        </div>

        {/* Mode Explanation */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
          {activeMode === 'webview' ? (
            <p>
              ✨ <strong>Model Web Lengkap:</strong> Menjadikan 100% seluruh fitur aplikasi ini (Simulator Chat WhatsApp interaktif, statistik, formulir delay) menjadi tampilan utama di HP Anda.
            </p>
          ) : (
            <p>
              ⚡ <strong>Model Form Ringkas:</strong> Menggunakan formulir Android bawaan sederhana khusus untuk menyimpan kata kunci dan jeda detik saja.
            </p>
          )}
        </div>
      </div>

      {/* Code Blocks Section */}
      <div className="space-y-5">
        
        {/* File 1: Service Kotlin (Latar Belakang WA) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>1. WhatsAppAutoReplyService.kt (Layanan Background WA)</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Lokasi: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">app/src/main/java/com/autoreply/whatsapp/</code>
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(serviceCode, 1)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {copiedIndex === 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin File 1</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
            {serviceCode}
          </pre>
        </div>

        {/* File 2: MainActivity.kt */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>2. MainActivity.kt (Tampilan di HP)</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Lokasi: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">app/src/main/java/com/autoreply/whatsapp/</code>
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(activeMode === 'webview' ? webViewMainActivityCode : nativeMainActivityCode, 2)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {copiedIndex === 2 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin File 2</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
            {activeMode === 'webview' ? webViewMainActivityCode : nativeMainActivityCode}
          </pre>
        </div>

        {/* File 3: activity_main.xml */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>3. activity_main.xml (Layout Desain Layar)</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Lokasi: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">app/src/main/res/layout/</code>
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(activeMode === 'webview' ? webViewLayoutXml : nativeLayoutXml, 3)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {copiedIndex === 3 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin File 3</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
            {activeMode === 'webview' ? webViewLayoutXml : nativeLayoutXml}
          </pre>
        </div>

        {/* File 4: AndroidManifest.xml */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>4. AndroidManifest.xml (Izin Sistem Android)</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Lokasi: <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">app/src/main/</code>
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(manifestCode, 4)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {copiedIndex === 4 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin File 4</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
            {manifestCode}
          </pre>
        </div>

      </div>
    </div>
  );
};
