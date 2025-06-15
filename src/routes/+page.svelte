<script lang="ts">
	// トップページコンポーネント
	// AppsScriptHubのメインランディングページ
	// ヒーローセクション、注目ライブラリ、CTA（コールトゥアクション）を表示
</script>

<svelte:head>
	<title>AppsScriptHub - Google Apps Scriptのライブラリハブ</title>
	<meta name="description" content="GASで使える便利なライブラリやツールを見つけ、共有するためのオープンなハブです。" />
</svelte:head>

<!-- ヒーローセクション -->
<section class="py-20 sm:py-28 text-center bg-gray-50">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
			GAS開発を、もっと速く、もっと便利に。
		</h1>
		<p class="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
			AppsScriptHubは、GASで使える便利なライブラリやツールを
			見つけ、共有するためのオープンなハブです。
		</p>
		<div class="mt-10 max-w-xl mx-auto">
			<form class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
					</svg>
				</div>
				<input type="search" name="search" id="search"
					class="block w-full rounded-full border-0 bg-white py-4 pl-11 pr-4 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
					placeholder="GASライブラリを検索">
			</form>
		</div>
	</div>
</section>

<!-- 注目のライブラリセクション -->
<section class="py-16 sm:py-24 bg-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
				注目のライブラリ
			</h2>
			<p class="mt-4 text-lg text-gray-600">
				コミュニティで評価されている、人気のライブラリを発見しましょう。
			</p>
		</div>

		<div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			<!-- ライブラリカード1 -->
			<div class="flex flex-col rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
				<div class="p-6 flex-1 flex flex-col">
					<h3 class="text-lg font-semibold text-gray-900">GasLogger</h3>
					<p class="mt-2 text-sm text-gray-600 flex-1">
						スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。
					</p>
				</div>
				<div class="px-6 pb-6 mt-auto">
					<div class="flex items-center text-xs text-gray-500 mb-4">
						<span>最終更新: 2025/05/28</span>
					</div>
					<div class="flex flex-wrap gap-2">
						<span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Logging</span>
						<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Utility</span>
						<span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Spreadsheet</span>
					</div>
				</div>
			</div>

			<!-- ライブラリカード2 -->
			<div class="flex flex-col rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
				<div class="p-6 flex-1 flex flex-col">
					<h3 class="text-lg font-semibold text-gray-900">GasHtml</h3>
					<p class="mt-2 text-sm text-gray-600 flex-1">
						HTMLテンプレートエンジン。サーバーサイドで動的にHTMLを生成し、複雑なWebアプリケーションの構築をサポートします。
					</p>
				</div>
				<div class="px-6 pb-6 mt-auto">
					<div class="flex items-center text-xs text-gray-500 mb-4">
						<span>最終更新: 2025/04/15</span>
					</div>
					<div class="flex flex-wrap gap-2">
						<span class="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10">WebApp</span>
						<span class="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">HTML</span>
					</div>
				</div>
			</div>
			
			<!-- ライブラリカード3 -->
			<div class="flex flex-col rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
				<div class="p-6 flex-1 flex flex-col">
					<h3 class="text-lg font-semibold text-gray-900">GasTest</h3>
					<p class="mt-2 text-sm text-gray-600 flex-1">
						GASプロジェクトのための軽量なユニットテストフレームワーク。テスト駆動開発(TDD)をGASで実現可能にします。
					</p>
				</div>
				<div class="px-6 pb-6 mt-auto">
					<div class="flex items-center text-xs text-gray-500 mb-4">
						<span>最終更新: 2025/03/30</span>
					</div>
					<div class="flex flex-wrap gap-2">
						<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Testing</span>
						<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Utility</span>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-12 text-center">
			<a href="/libraries" class="text-blue-600 font-semibold hover:underline">
				すべてのライブラリを見る &rarr;
			</a>
		</div>
	</div>
</section>

<!-- コールトゥアクションセクション -->
<section class="bg-gray-50">
	<div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 text-center">
		<h2 class="text-3xl font-bold tracking-tight text-gray-900">あなたのライブラリを公開しませんか？</h2>
		<p class="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
			作成した便利なGASライブラリやツールをAppsScriptHubで共有して、
			GASの開発スキルをアップしましょう!
		</p>
		<div class="mt-8 flex justify-center">
			<div class="inline-flex rounded-md shadow">
				<a href="/contribute"
					class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700">
					ライブラリの共有方法を見る
				</a>
			</div>
		</div>
	</div>
</section>
