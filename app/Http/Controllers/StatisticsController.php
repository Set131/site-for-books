<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Chapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StatisticsController extends Controller
{
    public function getStatistics(Request $request)
    {
        try {
            $period = $request->query('period', 'week');
            
            $chaptersData = $this->getChaptersStatistics($period);
            $usersData = $this->getUsersStatistics($period);
            $authorsData = $this->getAuthorsStatistics();
            
            return response()->json([
                'chapters' => $chaptersData,
                'users' => $usersData,
                'authors' => $authorsData
            ]);
        } catch (\Exception $e) {
            \Log::error('Statistics error: ' . $e->getMessage());
            
            return response()->json([
                'chapters' => ['labels' => [], 'data' => []],
                'users' => ['labels' => [], 'data' => []],
                'authors' => ['labels' => [], 'data' => []]
            ]);
        }
    }
    
    /**
     * Отримати користувачів за типом (з книгами або без)
     */
    public function getUsersByType(Request $request)
    {
        $request->validate([
            'type' => 'required|in:with_books,without_books'
        ]);

        try {
            $type = $request->query('type');
            
            if ($type === 'with_books') {
                $users = User::whereHas('books', function($query) {
                    $query->whereNotNull('id');
                })->get();
            } else {
                $users = User::whereDoesntHave('books')->get();
            }

            return response()->json($users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role,
                    'books_count' => $user->books()->count(),
                ];
            }));
        } catch (\Exception $e) {
            \Log::error('Get users by type error: ' . $e->getMessage());
            return response()->json(['error' => 'Помилка отримання користувачів'], 500);
        }
    }
    
    private function getChaptersStatistics($period)
    {
        try {
            if (!Schema::hasTable('chapters')) {
                return ['labels' => [], 'data' => []];
            }
            
            $dateRange = $this->getDateRange($period);
            $format = $this->getDateFormat($period);
            
            $data = Chapter::select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $dateRange['start'])
            ->where('created_at', '<=', $dateRange['end'])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
            
            if ($data->isEmpty()) {
                return $this->getEmptyData($period);
            }
            
            return $this->fillMissingDates($data, $period, $dateRange);
        } catch (\Exception $e) {
            \Log::error('Chapters error: ' . $e->getMessage());
            return $this->getEmptyData($period);
        }
    }
    
    private function getUsersStatistics($period)
    {
        try {
            if (!Schema::hasTable('users')) {
                return ['labels' => [], 'data' => []];
            }
            
            $dateRange = $this->getDateRange($period);
            $format = $this->getDateFormat($period);
            
            $data = User::select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $dateRange['start'])
            ->where('created_at', '<=', $dateRange['end'])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
            
            if ($data->isEmpty()) {
                return $this->getEmptyData($period);
            }
            
            return $this->fillMissingDates($data, $period, $dateRange);
        } catch (\Exception $e) {
            \Log::error('Users error: ' . $e->getMessage());
            return $this->getEmptyData($period);
        }
    }
    
    private function getAuthorsStatistics()
    {
        try {
            $totalUsers = User::count();
            $usersWithBooks = User::whereHas('books', function($query) {
                $query->whereNotNull('id');
            })->count();
            $usersWithoutBooks = $totalUsers - $usersWithBooks;
            
            return [
                'labels' => ['Мають книги', 'Не мають книг'],
                'data' => [$usersWithBooks, $usersWithoutBooks],
                'total' => $totalUsers
            ];
        } catch (\Exception $e) {
            \Log::error('Authors statistics error: ' . $e->getMessage());
            return ['labels' => [], 'data' => []];
        }
    }
    
    private function getDateRange($period)
    {
        $end = now()->endOfDay();
        $start = now()->startOfDay();
        
        switch($period) {
            case 'week':
                $start = now()->subDays(6)->startOfDay();
                break;
            case 'month':
                $start = now()->subDays(29)->startOfDay();
                break;
            case 'year':
                $start = now()->subMonths(11)->startOfMonth();
                $end = now()->endOfMonth();
                break;
        }
        
        return [
            'start' => $start,
            'end' => $end
        ];
    }
    
    private function getDateFormat($period)
    {
        switch($period) {
            case 'year':
                return '%Y-%m';
            default:
                return '%Y-%m-%d';
        }
    }
    
    private function fillMissingDates($data, $period, $dateRange)
    {
        $labels = [];
        $values = [];
        $dataMap = $data->pluck('count', 'date')->toArray();
        
        $current = clone $dateRange['start'];
        $end = clone $dateRange['end'];
        
        while ($current <= $end) {
            if ($period === 'year') {
                $dateKey = $current->format('Y-m');
                $labels[] = $dateKey;
                $values[] = isset($dataMap[$dateKey]) ? (int)$dataMap[$dateKey] : 0;
                $current->addMonth();
            } else {
                $dateKey = $current->format('Y-m-d');
                $labels[] = $dateKey;
                $values[] = isset($dataMap[$dateKey]) ? (int)$dataMap[$dateKey] : 0;
                $current->addDay();
            }
        }
        
        return [
            'labels' => $labels,
            'data' => $values
        ];
    }
    
    private function getEmptyData($period)
    {
        $labels = [];
        $data = [];
        
        $dateRange = $this->getDateRange($period);
        $current = clone $dateRange['start'];
        $end = clone $dateRange['end'];
        
        while ($current <= $end) {
            if ($period === 'year') {
                $labels[] = $current->format('Y-m');
                $data[] = 0;
                $current->addMonth();
            } else {
                $labels[] = $current->format('Y-m-d');
                $data[] = 0;
                $current->addDay();
            }
        }
        
        return [
            'labels' => $labels,
            'data' => $data
        ];
    }
}