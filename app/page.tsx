import { Nav } from "./components/nav";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="fixed left-0 top-0 flex w-full justify-center lg:static lg:w-auto lg:p-4">
          WooCommerce PR Previewer
        </h1>
        <p className="fixed right-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-r from-wp-blueberry-2 to-wp-blueberry-1 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-md lg:border lg:bg-gray-200 lg:p-4">
          Using&nbsp;
          <code className="font-mono font-bold">
            <a
              className="hover:text-woo-purple-80"
              href="https://github.com/WordPress/wordpress-playground"
            >
              WordPress Playground
            </a>
          </code>
        </p>
      </div>
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <Nav
          route="/woocommerce"
          title={"WooCommerce PRs"}
          description={"Preview PRs from the WooCommerce core repository."}
        />
      </div>
    </main>
  );
}
