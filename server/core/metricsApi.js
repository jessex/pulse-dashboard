/**
 * Utilities for retrieving and caching metrics for the app.
 *
 * In the current implementation, metrics are stored in pre-processed json files in Google Cloud
 * Storage. Those files are pulled down and cached in memory with a TTL. That TTL is unaffected by
 * access to the cache, so files are re-fetched at a predictable cadence, allowing for updates to
 * those files to be quickly reflected in the app without frequent requests to GCS.
 */

var objectStorage = require('./objectStorage');
var cacheManager = require('cache-manager');

const BUCKET_NAME = 'recidiviz-staging-dashboard-data';
const METRIC_CACHE_TTL_SECONDS = 60 * 60;  // Expire items in the cache after 1 hour

var memoryCache = cacheManager.caching({ store: 'memory', ttl: METRIC_CACHE_TTL_SECONDS });

const FILES_BY_METRIC_TYPE = {
  admission: [
    'admissions_by_type_60_days.json',
    'admissions_by_type_by_month.json',
    'admissions_versus_releases_by_month.json',
  ],
  reincarceration: [
    'reincarceration_rate_by_release_facility.json',
    'reincarceration_rate_by_stay_length.json',
    'reincarceration_rate_by_transitional_facility.json',
    'reincarcerations_by_month.json',
  ],
  revocation: [
    'revocations_by_month.json',
    'revocations_by_race_60_days.json',
    'revocations_by_supervision_type_by_month.json',
    'revocations_by_violation_type_by_month.json',
  ],
}

function fetchMetricsFromGCS(metricType) {
  const promises = [];

  const files = FILES_BY_METRIC_TYPE[metricType];
  files.forEach(function (filename) {
    const fileKey = filename.replace('.json', '');
    promises.push(objectStorage.downloadFile(BUCKET_NAME, filename).then(function (contents) {
      return { fileKey: fileKey, contents: contents };
    }));
  });

  return promises;
}

function fetchMetrics(metricType, callback) {
  return memoryCache.wrap(metricType, function (cacheCb) {
      console.log(`Fetching ${metricType} metrics from GCS...`);
      const metricPromises = fetchMetricsFromGCS(metricType);

      Promise.all(metricPromises).then(function (allFileContents) {
        console.log(`Fetched all ${metricType} metrics from GCS`);
        const results = {};
        allFileContents.forEach(function (contents) {
          const deserializedFile = convertDownloadToJson(contents.contents);
          results[contents.fileKey] = deserializedFile;
        });

        cacheCb(null, results);
      });
  }, callback);
}

function convertDownloadToJson(contents) {
  const stringContents = contents.toString();
  if (!stringContents || stringContents.length === 0) {
    return null;
  }
  return JSON.parse(contents.toString());
}

function fetchAdmissionMetrics(callback) {
  return fetchMetrics('admission', callback);
}

function fetchReincarcerationMetrics(callback) {
  return fetchMetrics('reincarceration', callback);
}

function fetchRevocationMetrics(callback) {
  return fetchMetrics('revocation', callback);
}

module.exports = {
  fetchAdmissionMetrics: fetchAdmissionMetrics,
  fetchReincarcerationMetrics: fetchReincarcerationMetrics,
  fetchRevocationMetrics: fetchRevocationMetrics,
}
