import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PrivacyPolicyView extends StatelessWidget {
  PrivacyPolicyView({super.key});

  final controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..loadRequest(
      Uri.parse("https://cycletowork.mondora.com/privacy-policy"),
    );

  @override
  Widget build(BuildContext context) {
    var colorScheme = Theme.of(context).colorScheme;
    var textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          'Privacy Policy',
          style: textTheme.bodyLarge,
        ),
        leading: IconButton(
          splashRadius: 25.0,
          icon: Icon(
            Icons.arrow_back_ios,
            color: colorScheme.onSurface,
            size: 20,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: WebViewWidget(
        controller: controller,
      ),
    );
  }
}
