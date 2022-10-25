const statusPageRegExp = new RegExp("^/[^/]+/status/");
const profilePageSelector = '[data-testid="UserName"]';
const exploreSelector = '[data-testid="AppTabBar_Explore_Link"]';

const getUserName = () => {
  return location.pathname.split("/")[1];
};

const update = () => {
  // user home
  if (document.querySelector(profilePageSelector)) {
    const userName = getUserName();
    replaceSearchLink({ userName });
    return;
  }

  // 個別ツイート
  if (statusPageRegExp.test(location.pathname)) {
    const datetime = document.querySelector("time")?.getAttribute("datetime");
    if (datetime == null) return;

    // ツイートtimeに+1して当該ツイート以前を表示する
    const untilTime = new Date(datetime).getTime() / 1000 + 1;
    const userName = getUserName();
    replaceSearchLink({ userName, untilTime });
  }
};

const replaceSearchLink = (params: {
  userName: string;
  untilTime?: number;
}) => {
  const exploreEl = document.querySelector(exploreSelector);
  if (exploreEl == null) return;

  const searchQueryObject = {
    from: params.userName,
    until_time: params.untilTime,
  };
  const searchQueryString = Object.entries(searchQueryObject)
    .flatMap(([key, val]) => {
      return val == null ? [] : `${key}:${val}`;
    })
    .join(" ");

  const searchParams = new URLSearchParams([
    ["q", searchQueryString],
    ["src", "typed_query"],
    ["f", "live"],
  ]);

  const url = new URL(location.toString());
  url.pathname = "/search";
  url.search = searchParams.toString();

  exploreEl.setAttribute("href", url.href);

  // hrefを変えてもjsで遷移してしまうのでclickイベントを上書きする
  exploreEl.addEventListener("click", (evt) => {
    evt.preventDefault();
    location.href = url.href;
  });
};

new PerformanceObserver(() => {
  update();
}).observe({
  type: "longtask",
  buffered: true,
});

document.addEventListener("scroll", () => {
  update();
});
