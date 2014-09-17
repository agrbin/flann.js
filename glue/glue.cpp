#include <sstream>
#include <iostream>

#include "glue.h"

namespace {

  void add_param(
      flann::IndexParams &params,
      const std::string &key,
      const std::string &value_str) {
    std::istringstream value_ss(value_str);

    if (key == "cb_index") {
      float value;
      value_ss >> value;
      params[key] = value;
      return;
    }

    int value;
    value_ss >> value;

    if (key == "algorithm") {
      params[key] = (flann::flann_algorithm_t) value;
    } else if (key == "centers_init") {
      params[key] = (flann::flann_centers_init_t) value;
    } else if (key == "log_level") {
      params[key] = (flann::flann_log_level_t) value;
    } else {
      // this is for save_dataset
      if (value_str == "true" || value_str == "false") {
        params[key] = (value_str == "true");
      } else {
        params[key] = value;
      }
    }
  }

  void parse_options(flann::IndexParams &params, const char *options) {
    if (options == NULL || !strlen(options)) {
      return;
    } else {
      std::istringstream iss(options);
      std::string pair;
      params.clear();
      while (iss >> pair) {
        size_t pos = pair.find('=');
        if (pos == std::string::npos) {
          fprintf(stderr, "ignoring bad option word %s\n", pair.c_str());
        } else {
          add_param(params, pair.substr(0, pos), pair.substr(pos + 1));
        }
      }
    }
  }

  char* serialize_params(IndexPtr idx) {
    flann::IndexParams p = idx->getParameters();
    std::string str;
    {
      std::ostringstream ss;
      for (flann::IndexParams::const_iterator it = p.begin();
          it != p.end();
          ++it) {
        if (it->first != "search_params") {
          ss << it->first << "=" << it->second << " ";
        }
      }
      str = ss.str();
    }
    char *sol = (char*) malloc(str.size() + 1);
    memcpy(sol, str.c_str(), str.size());
    sol[str.size()] = 0;
    return sol;
  }

}

IndexPtr buildFromDataset(
    float *data,
    int N,
    int K,
    const char *options) {
  try {
    flann::Matrix<float> dataset(data, N, K);
    flann::AutotunedIndexParams params;
    parse_options(params, options);
    IndexPtr idx = new IndexType(dataset, params);
    idx->buildIndex();
    return idx;
  } catch (std::exception &e) {
    fprintf(stderr, "exception while building from dataset: %s\n", e.what());
    return NULL;
  }
}

IndexPtr buildFromFile(
    float *data,
    int N,
    int K,
    const char *file) {
  try {
    std::string filename(file);
    flann::SavedIndexParams params(filename);
    if (data == NULL) {
      IndexPtr idx = new IndexType(params);
      idx->buildIndex();
      return idx;
    } else {
      flann::Matrix<float> dataset(data, N, K);
      IndexPtr idx = new IndexType(dataset, params);
      idx->buildIndex();
      return idx;
    }
  } catch (std::exception &e) {
    fprintf(stderr, "exception while building from file: %s\n", e.what());
    return NULL;
  }
}

void saveIndex(IndexPtr idx, const char *filename) {
  try {
    idx->save(filename);
  } catch (std::exception &e) {
    fprintf(stderr, "exception while saving: %s\n", e.what());
  }
}

void destroyIndex(IndexPtr idx) {
  delete idx;
}

// how many records were found
int knnSearch(
    IndexPtr idx,
    float *data,
    int *ids,
    float *dists,
    int nn,
    int Q,
    int K) {
  try {
    flann::Matrix<float> query(data, Q, K);
    flann::Matrix<int> indices(ids, Q, nn);
    flann::Matrix<float> distances(dists, Q, nn);
    return idx->knnSearch(
        query,
        indices,
        distances,
        nn,
        flann::SearchParams());
  } catch (std::exception &e) {
    fprintf(stderr, "exception while searching: %s\n", e.what());
    return 0;
  }
}

int indexVeclen(IndexPtr idx) {
  return idx->veclen();
}

int indexSize(IndexPtr idx) {
  return idx->size();
}

char* indexParameters(IndexPtr idx) {
  try {
    return serialize_params(idx);
  } catch (std::exception &e) {
    fprintf(stderr, "exception while getting paramas: %s\n", e.what());
    return NULL;
  }
}


// we use this to avoid losing these functions from assembly
void __unreachable() {
  buildFromDataset(NULL, 0, 0, NULL);
  buildFromFile(NULL, 0, 0, NULL);
  saveIndex(NULL, NULL);
  destroyIndex(NULL);
  knnSearch(NULL, NULL, NULL, NULL, 0, 0, 0);
  indexParameters(NULL);
}

