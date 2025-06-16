<script module>
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  // ライブラリカードコンポーネントのStorybook設定
  // 異なるライブラリ情報のバリエーションを表示し、動作を検証
  const { Story } = defineMeta({
    title: 'AppsScriptHub/LibraryCard',
    component: LibraryCard,
    tags: ['autodocs'],
    argTypes: {
      library: {
        control: 'object',
        description: 'ライブラリ情報オブジェクト',
      },
    },
    parameters: {
      docs: {
        description: {
          component:
            'GASライブラリの情報を表示するカードコンポーネント。検索結果やライブラリ一覧ページで使用されます。',
        },
      },
    },
  });

  // テスト用のライブラリデータ
  const mockLibrary = {
    id: 1,
    name: 'GasDateFormatter',
    description:
      'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマットするためのユーティリティライブラリ。タイムゾーンの扱いもサポート。',
    tags: ['Date', 'Utility', 'Format'],
    author: 'user-name',
    version: 'v1.2.0',
    lastUpdated: '3日前',
  };

  const longDescriptionLibrary = {
    id: 2,
    name: 'SuperLongLibraryNameThatMightWrapToMultipleLines',
    description:
      'このライブラリは非常に長い説明文を持っています。この説明文は複数行にわたって表示される可能性があり、カードレイアウトがどのように対応するかをテストするために使用されます。さらに長い文章を追加して、レイアウトの動作を確認します。',
    tags: ['Test', 'LongText', 'Layout', 'UI', 'Responsive'],
    author: 'very-long-username-for-testing',
    version: 'v10.25.100',
    lastUpdated: '1年前',
  };

  const minimalLibrary = {
    id: 3,
    name: 'SimpleLib',
    description: 'シンプルなライブラリ',
    tags: ['Simple'],
    author: 'dev',
    version: 'v1.0.0',
    lastUpdated: '今日',
  };
</script>

<!-- デフォルトのライブラリカード -->
<Story
  name="Default"
  args={{
    library: mockLibrary,
  }}
  play={async ({ canvasElement }) => {
    // ライブラリ名が表示されることを確認
    const libraryName = canvasElement.querySelector('h2 a');
    if (!libraryName) throw new Error('ライブラリ名が見つかりません');
    if (libraryName.textContent !== 'GasDateFormatter')
      throw new Error('ライブラリ名が正しく表示されていません');
    if (libraryName.getAttribute('href') !== '/libraries/1')
      throw new Error('ライブラリリンクが正しくありません');

    // 説明文が表示されることを確認
    const description = canvasElement.querySelector('p');
    if (!description) throw new Error('説明文が見つかりません');
    if (!description.textContent?.includes('Moment.jsライクなシンタックス'))
      throw new Error('説明文が正しく表示されていません');

    // タグが表示されることを確認
    const tags = canvasElement.querySelectorAll('span');
    const tagTexts = Array.from(tags).map(tag => tag.textContent);
    if (!tagTexts.includes('Date')) throw new Error('Dateタグが見つかりません');
    if (!tagTexts.includes('Utility'))
      throw new Error('Utilityタグが見つかりません');
    if (!tagTexts.includes('Format'))
      throw new Error('Formatタグが見つかりません');

    // 作成者情報が表示されることを確認
    const authorLinks = canvasElement.querySelectorAll('a');
    const authorLink = Array.from(authorLinks).find(
      link => link.textContent === 'user-name'
    );
    if (!authorLink) throw new Error('作成者リンクが見つかりません');
    if (authorLink.getAttribute('href') !== '/users/user-name')
      throw new Error('作成者リンクが正しくありません');

    // バージョン情報と最終更新日が表示されることを確認
    const textContent = canvasElement.textContent || '';
    if (!textContent.includes('v1.2.0'))
      throw new Error('バージョン情報が見つかりません');
    if (!textContent.includes('最終更新: 3日前'))
      throw new Error('最終更新日が見つかりません');
  }}
/>

<!-- 長い説明文とライブラリ名のテスト -->
<Story
  name="LongContent"
  args={{
    library: longDescriptionLibrary,
  }}
  play={async ({ canvasElement }) => {
    // 長いライブラリ名が表示されることを確認
    const libraryName = canvasElement.querySelector('h2 a');
    if (!libraryName) throw new Error('ライブラリ名が見つかりません');
    if (
      libraryName.textContent !==
      'SuperLongLibraryNameThatMightWrapToMultipleLines'
    )
      throw new Error('長いライブラリ名が正しく表示されていません');

    // 長い説明文が表示されることを確認
    const description = canvasElement.querySelector('p');
    if (!description) throw new Error('説明文が見つかりません');
    if (!description.textContent?.includes('このライブラリは非常に長い説明文'))
      throw new Error('長い説明文が正しく表示されていません');

    // 多数のタグが表示されることを確認
    const tags = canvasElement.querySelectorAll('span');
    const tagTexts = Array.from(tags).map(tag => tag.textContent);
    const expectedTags = ['Test', 'LongText', 'Layout', 'UI', 'Responsive'];
    expectedTags.forEach(tag => {
      if (!tagTexts.includes(tag))
        throw new Error(`${tag}タグが見つかりません`);
    });
  }}
/>

<!-- 最小限の情報を持つライブラリカード -->
<Story
  name="Minimal"
  args={{
    library: minimalLibrary,
  }}
  play={async ({ canvasElement }) => {
    // 基本情報が表示されることを確認
    const libraryName = canvasElement.querySelector('h2 a');
    if (!libraryName) throw new Error('ライブラリ名が見つかりません');
    if (libraryName.textContent !== 'SimpleLib')
      throw new Error('ライブラリ名が正しく表示されていません');

    const description = canvasElement.querySelector('p');
    if (!description) throw new Error('説明文が見つかりません');
    if (description.textContent !== 'シンプルなライブラリ')
      throw new Error('説明文が正しく表示されていません');

    const textContent = canvasElement.textContent || '';
    if (!textContent.includes('Simple'))
      throw new Error('Simpleタグが見つかりません');
    if (!textContent.includes('dev'))
      throw new Error('作成者情報が見つかりません');
  }}
/>

<!-- ホバー効果のテスト -->
<Story
  name="Interactive"
  args={{
    library: mockLibrary,
  }}
  play={async ({ canvasElement, step }) => {
    await step('ライブラリ名のリンク動作確認', async () => {
      const libraryNameLink = canvasElement.querySelector('h2 a');
      if (!libraryNameLink)
        throw new Error('ライブラリ名リンクが見つかりません');
      if (libraryNameLink.textContent !== 'GasDateFormatter')
        throw new Error('ライブラリ名が正しく表示されていません');
      if (libraryNameLink.getAttribute('href') !== '/libraries/1')
        throw new Error('リンク先が正しくありません');
    });

    await step('作成者のリンク動作確認', async () => {
      const authorLinks = canvasElement.querySelectorAll('a');
      const authorLink = Array.from(authorLinks).find(
        link => link.textContent === 'user-name'
      );
      if (!authorLink) throw new Error('作成者リンクが見つかりません');
      if (authorLink.getAttribute('href') !== '/users/user-name')
        throw new Error('作成者リンク先が正しくありません');
    });

    await step('カード要素の存在確認', async () => {
      const cardElement = canvasElement.querySelector('div');
      if (!cardElement) throw new Error('カード要素が見つかりません');
      if (
        !cardElement.classList.contains('border') ||
        !cardElement.classList.contains('rounded-lg')
      ) {
        throw new Error('カードのスタイルが正しくありません');
      }
    });
  }}
/>

<!-- 異なるタグ組み合わせのテスト -->
<Story
  name="VariousTags"
  args={{
    library: {
      id: 4,
      name: 'CalendarEventUtil',
      description:
        'Googleカレンダーのイベント作成・更新・削除をより直感的に行えるヘルパー集。',
      tags: ['Calendar', 'Date', 'Japan', 'Holiday'],
      author: 'calendar-master',
      version: 'v2.1.0',
      lastUpdated: '1週間前',
    },
  }}
  play={async ({ canvasElement }) => {
    // 異なる色のタグが表示されることを確認
    const tags = canvasElement.querySelectorAll('span');
    const tagTexts = Array.from(tags).map(tag => tag.textContent);

    const expectedTags = ['Calendar', 'Date', 'Japan', 'Holiday'];
    expectedTags.forEach(tag => {
      if (!tagTexts.includes(tag))
        throw new Error(`${tag}タグが見つかりません`);
    });

    // タグがspan要素で表示されることを確認
    if (tags.length === 0) throw new Error('タグが表示されていません');
    tags.forEach(tag => {
      if (tag.tagName !== 'SPAN')
        throw new Error('タグがSPAN要素ではありません');
    });
  }}
/>
