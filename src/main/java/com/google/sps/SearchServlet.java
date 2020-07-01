// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import com.google.gson.Gson;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.FetchOptions;
import java.text.SimpleDateFormat;  
import java.util.Date;
import org.json.JSONObject;
import org.json.JSONException;
import org.json.HTTP;
import com.google.sps.data.Search;

@WebServlet("/searches")
public class SearchServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String user = request.getParameter("user");
    Filter propertyFilter = new FilterPredicate("user", FilterOperator.EQUAL, user);
    Query query = new Query("savedSearch").setFilter(propertyFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);


    List<Search> searches = new ArrayList<>();
    //results.asIterable(FetchOptions.Builder.withLimit(commentAmount))
    for (Entity entity : results.asIterable()) {
      String userID = (String) entity.getProperty("user");
      String date = (String) entity.getProperty("date");
      String keywords = (String) entity.getProperty("keywords");
      int radius = (int) entity.getProperty("radius");
      String url = (String) entity.getProperty("url");
      long id = entity.getKey().getId();

      Search search = new Search(userID, date, keywords, url, radius, id);
      searches.add(search);
    }
    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(searches));
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String user = request.getParameter("user");
    String radius = request.getParameter("radius");
    String keywords = request.getParameter("keywords");
    String url = request.getParameter("url");
    long timestamp = System.currentTimeMillis();

    SimpleDateFormat formatter = new SimpleDateFormat("MMM d, 'at' HH:mm");
    Date date = new Date(System.currentTimeMillis());
    String formattedDate = formatter.format(date);


    //Make an entity
    Entity searchEntity = new Entity("savedSearch");
    searchEntity.setProperty("user", user);
    searchEntity.setProperty("radius", radius);
    searchEntity.setProperty("date", formattedDate);
    searchEntity.setProperty("keywords", keywords);
    searchEntity.setProperty("timestamp", timestamp);
    searchEntity.setProperty("url", url);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(searchEntity);

    // Redirect back to the HTML page.
    response.sendRedirect("/index.html");
  }
}
