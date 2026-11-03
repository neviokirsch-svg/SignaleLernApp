import SwiftUI
import UIKit
import WebKit

/// Zeigt die Lernapp aus Resources/index.html. Die Inhalte bestehen fast nur aus Formeln und Signalplots,
/// deshalb teilen sich App und Webversion eine einzige Oberfläche.
struct WebShell: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        controller.add(context.coordinator, name: "progress")
        // Der Lernstand liegt zusätzlich in einer Datei, weil iOS den Webspeicher löschen darf.
        if let saved = ProgressFile.load() {
            let source = "window.SS_NATIVE_PROGRESS = \(saved);"
            controller.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.websiteDataStore = .default()

        let web = WKWebView(frame: .zero, configuration: config)
        web.isOpaque = false
        web.backgroundColor = UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(red: 0.04, green: 0.063, blue: 0.11, alpha: 1)
                : UIColor(red: 0.918, green: 0.937, blue: 0.969, alpha: 1)
        }
        web.scrollView.backgroundColor = .clear
        // Die Seite berücksichtigt Notch und Home-Balken selbst.
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = true
        web.navigationDelegate = context.coordinator

        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            web.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "progress", let json = message.body as? String else { return }
            ProgressFile.save(json)
        }

        // Die App ist komplett offline und zeigt nur ihre eigene Datei.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.request.url?.isFileURL == true ? .allow : .cancel)
        }

        // iOS beendet den Web-Prozess manchmal im Hintergrund. Dann einfach neu laden.
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()
        }
    }
}

enum ProgressFile {
    private static var url: URL? {
        guard let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else { return nil }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("progress.json")
    }

    /// Liefert den gespeicherten Lernstand, aber nur wenn er gültiges JSON ist. Er wird als Skript eingefügt.
    static func load() -> String? {
        guard let url, let data = try? Data(contentsOf: url),
              (try? JSONSerialization.jsonObject(with: data)) is [String: Any] else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func save(_ json: String) {
        guard let url else { return }
        try? json.data(using: .utf8)?.write(to: url, options: .atomic)
    }
}
