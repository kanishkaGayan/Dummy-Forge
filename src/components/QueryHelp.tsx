import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

interface QueryHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'basics' | 'aggregates' | 'filtering' | 'functions' | 'unsupported';

export const QueryHelp: React.FC<QueryHelpProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Query Studio Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('basics')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'basics'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Basics
          </button>
          <button
            onClick={() => setActiveTab('aggregates')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'aggregates'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Aggregates
          </button>
          <button
            onClick={() => setActiveTab('filtering')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'filtering'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Filtering
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'functions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Functions
          </button>
          <button
            onClick={() => setActiveTab('unsupported')}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'unsupported'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Not Supported
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Basic Queries</h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Select all columns</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Select specific columns</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT firstName, lastName, email FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Column aliases</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT firstName AS first, lastName AS last FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Limit results</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data LIMIT 10;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Order by column</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data ORDER BY age DESC;
                    </code>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'aggregates' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Aggregate Functions</h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Count all rows</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT COUNT(*) FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Count with alias</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT COUNT(*) AS total FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Group by with count</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT gender, COUNT(*) AS count FROM data GROUP BY gender;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Average, sum, min, max</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT AVG(age) AS avg_age, SUM(age) AS total_age,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MIN(age) AS youngest, MAX(age) AS oldest<br />
                      FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">HAVING clause (filter groups)</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT email, COUNT(*) AS occurrences<br />
                      FROM data<br />
                      GROUP BY email<br />
                      HAVING COUNT(*) &gt; 1<br />
                      ORDER BY occurrences DESC;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Multiple GROUP BY columns</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT gender, age, COUNT(*) AS count<br />
                      FROM data<br />
                      GROUP BY gender, age;
                    </code>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'filtering' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">WHERE Conditions</h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Equality (text must be quoted)</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data WHERE gender = "male";<br />
                      SELECT * FROM data WHERE gender = 'female';
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Comparisons</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data WHERE age &gt; 25;<br />
                      SELECT * FROM data WHERE age &lt;= 18;<br />
                      SELECT * FROM data WHERE age != 30;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">LIKE pattern matching</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data WHERE email LIKE "%@gmail.com";<br />
                      SELECT * FROM data WHERE firstName LIKE "A%";
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">NOT LIKE (find missing patterns)</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT stuID, firstName, email<br />
                      FROM data<br />
                      WHERE email NOT LIKE "%@%";
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">AND / OR logic</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT * FROM data WHERE age &gt; 18 AND gender = "male";<br />
                      SELECT * FROM data WHERE age &lt; 18 OR age &gt; 65;
                    </code>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">String Functions</h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">SUBSTRING_INDEX (extract parts)</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT SUBSTRING_INDEX(email, '@', -1) AS domain<br />
                      FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Group by expression</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT SUBSTRING_INDEX(email, '@', -1) AS domain,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;COUNT(*) AS count<br />
                      FROM data<br />
                      GROUP BY SUBSTRING_INDEX(email, '@', -1)<br />
                      ORDER BY count DESC;
                    </code>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">CASE Statements</h3>
                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Simple CASE</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT firstName,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CASE<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;WHEN age &lt; 18 THEN "Minor"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ELSE "Adult"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;END AS age_category<br />
                      FROM data;
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Multiple WHEN conditions</p>
                    <code className="block rounded bg-slate-100 p-2 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      SELECT<br />
                      &nbsp;&nbsp;CASE<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age &lt; 18 THEN "Under 18"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age BETWEEN 18 AND 29 THEN "18-29"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age BETWEEN 30 AND 49 THEN "30-49"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;ELSE "50+"<br />
                      &nbsp;&nbsp;END AS age_group,<br />
                      &nbsp;&nbsp;COUNT(*) AS count<br />
                      FROM data<br />
                      GROUP BY<br />
                      &nbsp;&nbsp;CASE<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age &lt; 18 THEN "Under 18"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age BETWEEN 18 AND 29 THEN "18-29"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;WHEN age BETWEEN 30 AND 49 THEN "30-49"<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;ELSE "50+"<br />
                      &nbsp;&nbsp;END;
                    </code>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'unsupported' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-base font-semibold text-red-700 dark:text-red-400">Not Supported</h3>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Query Studio operates on a single table (<code className="rounded bg-red-50 px-1 text-red-700 dark:bg-red-900/30 dark:text-red-400">data</code>) for educational purposes.
                  The following features require multiple tables or advanced database operations and are not available:
                </p>
                <div className="space-y-3">
                  <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">❌ JOINs (relationships)</p>
                    <code className="block rounded bg-white p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      -- NOT SUPPORTED<br />
                      SELECT * FROM data<br />
                      JOIN other_table ON data.id = other_table.id;
                    </code>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Only one table is available. Query directly from <code>data</code>.
                    </p>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">❌ Subqueries</p>
                    <code className="block rounded bg-white p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      -- NOT SUPPORTED<br />
                      SELECT * FROM data<br />
                      WHERE age &gt; (SELECT AVG(age) FROM data);
                    </code>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Use single-level queries with WHERE, GROUP BY, and HAVING instead.
                    </p>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">❌ Set Operations</p>
                    <code className="block rounded bg-white p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      -- NOT SUPPORTED<br />
                      SELECT firstName FROM data<br />
                      UNION<br />
                      SELECT lastName FROM data;
                    </code>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      UNION, INTERSECT, EXCEPT are not available.
                    </p>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">❌ Common Table Expressions (CTEs)</p>
                    <code className="block rounded bg-white p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      -- NOT SUPPORTED<br />
                      WITH summary AS (<br />
                      &nbsp;&nbsp;SELECT * FROM data WHERE age &gt; 25<br />
                      )<br />
                      SELECT * FROM summary;
                    </code>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      WITH clause is not supported. Use direct queries instead.
                    </p>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">❌ Window Functions</p>
                    <code className="block rounded bg-white p-2 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      -- NOT SUPPORTED<br />
                      SELECT firstName, age,<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ROW_NUMBER() OVER (ORDER BY age) AS rank<br />
                      FROM data;
                    </code>
                    <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                      Use ORDER BY and LIMIT for basic ranking instead.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            💡 Pro tip: Use Tab or Enter to accept autocomplete suggestions while typing your query.
          </p>
        </div>
      </div>
    </div>
  );
};
