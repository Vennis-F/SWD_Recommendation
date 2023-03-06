import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
import { useInstantSearch } from 'react-instantsearch-hooks-web';
import { useLayoutEffect } from 'react';

export default function InsightsMiddleware() {
  const { use } = useInstantSearch();

  useLayoutEffect(() => {
    const middleware = createInsightsMiddleware({
      insightsClient: aa,
    });

    return use(middleware);
  }, [use]);

  return null;
}
