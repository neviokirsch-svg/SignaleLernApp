import SwiftUI

@main
struct SignaleApp: App {
    var body: some Scene {
        WindowGroup {
            WebShell()
                .ignoresSafeArea()
        }
    }
}
